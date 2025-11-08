"use server";

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import prisma from './prisma';
import { generateUniqueCategorySlug, generateUniqueBrandSlug, generateUniqueProductSlug } from './slug-utils';
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};
export type CategoryState = {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
  };
  message?: string | null;
};
export type BrandState = {
  errors?: {
    name?: string[];
    slug?: string[];
  };
  message?: string | null;
};
export type ProductState = {
  errors?: {
    name?: string[];
    slug?: string[];
    description?: string[];
    price?: string[];
    stock?: string[];
    categoryId?: string[];
    brandId?: string[];
    images?: string[];
  };
  message?: string | null;
};
export type CouponState = {
  errors?: {
    code?: string[];
    description?: string[];
    discountType?: string[];
    discountValue?: string[];
    minOrderValue?: string[];
    isActive?: string[];
    expiresAt?: string[];
  };
  message?: string | null;
};
export type OrderState = {
  errors?: {
    status?: string[];
  };
  message?: string | null;
};
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Customer name is required",
  }),
  amount: z.coerce.number().gt(0, { message: 'Amount must be greater than 0' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: "Invoice Status is required",
  }),
  date: z.string(),
});
const SignupSchema = z.object({
  name: z.string({
    invalid_type_error: "Name is required",
  }).min(3, { message: 'Minimum 3 Chracters Required' }),
  email: z.string({
    invalid_type_error: "Email is required",
  }).email("Invalid email address"),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const SignupUser = SignupSchema.omit({});

// Category Schemas
const CategorySchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: "Category name is required",
  }).min(1, { message: 'Category name is required' }),
  slug: z.string().optional(), // Slug is auto-generated from name
  description: z.string().optional(),
});
const CreateCategory = CategorySchema.omit({ id: true });
const UpdateCategory = CategorySchema.omit({ id: true });

// Brand Schemas
const BrandSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: "Brand name is required",
  }).min(1, { message: 'Brand name is required' }),
  slug: z.string().optional(), // Slug is auto-generated from name
});
const CreateBrand = BrandSchema.omit({ id: true });
const UpdateBrand = BrandSchema.omit({ id: true });

// Product Schemas
const ProductSchemaBase = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: "Product name is required",
  }).min(1, { message: 'Product name is required' }),
  slug: z.string().optional(), // Slug is auto-generated from name
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().int().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  images: z.string().optional(), // JSON string, will be parsed
  productType: z.enum(['SIMPLE', 'VARIABLE']),
});

const ProductSchema = ProductSchemaBase.superRefine((data, ctx) => {
  if (data.productType === 'SIMPLE') {
    if (data.price === undefined || data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Price must be greater than 0 for simple products',
      });
    }
    if (data.stock === undefined || data.stock < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stock'],
        message: 'Stock must be a non-negative integer for simple products',
      });
    }
  }
});

const CreateProduct = ProductSchemaBase.omit({ id: true }).superRefine((data, ctx) => {
  if (data.productType === 'SIMPLE') {
    if (data.price === undefined || data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Price must be greater than 0 for simple products',
      });
    }
    if (data.stock === undefined || data.stock < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stock'],
        message: 'Stock must be a non-negative integer for simple products',
      });
    }
  }
});
const UpdateProduct = ProductSchemaBase.omit({ id: true }).superRefine((data, ctx) => {
  if (data.productType === 'SIMPLE') {
    if (data.price === undefined || data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Price must be greater than 0 for simple products',
      });
    }
    if (data.stock === undefined || data.stock < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stock'],
        message: 'Stock must be a non-negative integer for simple products',
      });
    }
  }
});

// Coupon Schemas
const CouponSchema = z.object({
  id: z.string(),
  code: z.string({
    invalid_type_error: "Coupon code is required",
  }).min(1, { message: 'Coupon code is required' }).regex(/^[A-Z0-9_-]+$/, { message: 'Code must be uppercase alphanumeric with hyphens or underscores' }),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    invalid_type_error: "Discount type is required",
  }),
  discountValue: z.coerce.number().gt(0, { message: 'Discount value must be greater than 0' }),
  minOrderValue: z.coerce.number().min(0, { message: 'Minimum order value must be non-negative' }).optional(),
  isActive: z.coerce.boolean().optional(),
  expiresAt: z.string().optional(), // ISO date string
});
const CreateCoupon = CouponSchema.omit({ id: true });
const UpdateCoupon = CouponSchema.omit({ id: true });

// Order Schemas (only status update)
const OrderSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    invalid_type_error: "Order status is required",
  }),
});
const UpdateOrderStatus = OrderSchema.omit({ id: true });
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  console.log(customerId)
  try {
    await prisma.invoice.create({
      data: {
        user_id: customerId,
        amount: amountInCents,
        status: status.toUpperCase() as any,
      },
    });
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function signup(
  prevState: UserState,
  formData: FormData) {
  //implement signup logic here in future
  const validatedFields = SignupUser.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }
  console.log(validatedFields.data);
  const { name, email, password } = validatedFields.data;
  const newPassword = await bcrypt.hash(password, 10);

  try {
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name},${email}, ${newPassword})
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: 'Database Error: Failed to Create User.',
    };
  }
  redirect('/login');
}

// Category CRUD Actions
export async function createCategory(prevState: CategoryState, formData: FormData) {
  const validatedFields = CreateCategory.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Category.',
    };
  }

  const { name, slug, description } = validatedFields.data;

  // Auto-generate slug from name if not provided
  const finalSlug = slug || await generateUniqueCategorySlug(name);

  try {
    await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      // If slug conflict, regenerate and retry once
      const retrySlug = await generateUniqueCategorySlug(name);
      try {
        await prisma.category.create({
          data: {
            name,
            slug: retrySlug,
            description: description || null,
          },
        });
      } catch (retryError) {
        return {
          message: 'Database Error: Failed to Create Category.',
        };
      }
    } else {
      return {
        message: 'Database Error: Failed to Create Category.',
      };
    }
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

export async function updateCategory(id: string, prevState: CategoryState, formData: FormData) {
  const validatedFields = UpdateCategory.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Category.',
    };
  }

  const { name, slug, description } = validatedFields.data;

  // Get current category to check if name changed
  const currentCategory = await prisma.category.findUnique({ where: { id } });

  // Auto-generate slug from name if not provided or if name changed
  const finalSlug = slug || (currentCategory?.name !== name
    ? await generateUniqueCategorySlug(name, id)
    : currentCategory.slug);

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        description: description || null,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      // If slug conflict, regenerate and retry once
      const retrySlug = await generateUniqueCategorySlug(name, id);
      try {
        await prisma.category.update({
          where: { id },
          data: {
            name,
            slug: retrySlug,
            description: description || null,
          },
        });
      } catch (retryError) {
        return {
          message: 'Database Error: Failed to Update Category.',
        };
      }
    } else {
      return {
        message: 'Database Error: Failed to Update Category.',
      };
    }
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete category.');
  }
  revalidatePath('/dashboard/categories');
}

// Brand CRUD Actions
export async function createBrand(prevState: BrandState, formData: FormData) {
  const validatedFields = CreateBrand.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Brand.',
    };
  }

  const { name, slug } = validatedFields.data;

  // Auto-generate slug from name if not provided
  const finalSlug = slug || await generateUniqueBrandSlug(name);

  try {
    await prisma.brand.create({
      data: {
        name,
        slug: finalSlug,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      // If slug conflict, regenerate and retry once
      const retrySlug = await generateUniqueBrandSlug(name);
      try {
        await prisma.brand.create({
          data: {
            name,
            slug: retrySlug,
          },
        });
      } catch (retryError) {
        return {
          message: 'Database Error: Failed to Create Brand.',
        };
      }
    } else {
      return {
        message: 'Database Error: Failed to Create Brand.',
      };
    }
  }

  revalidatePath('/dashboard/brands');
  redirect('/dashboard/brands');
}

export async function updateBrand(id: string, prevState: BrandState, formData: FormData) {
  const validatedFields = UpdateBrand.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Brand.',
    };
  }

  const { name, slug } = validatedFields.data;

  // Get current brand to check if name changed
  const currentBrand = await prisma.brand.findUnique({ where: { id } });

  // Auto-generate slug from name if not provided or if name changed
  const finalSlug = slug || (currentBrand?.name !== name
    ? await generateUniqueBrandSlug(name, id)
    : currentBrand.slug);

  try {
    await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      // If slug conflict, regenerate and retry once
      const retrySlug = await generateUniqueBrandSlug(name, id);
      try {
        await prisma.brand.update({
          where: { id },
          data: {
            name,
            slug: retrySlug,
          },
        });
      } catch (retryError) {
        return {
          message: 'Database Error: Failed to Update Brand.',
        };
      }
    } else {
      return {
        message: 'Database Error: Failed to Update Brand.',
      };
    }
  }

  revalidatePath('/dashboard/brands');
  redirect('/dashboard/brands');
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete brand.');
  }
  revalidatePath('/dashboard/brands');
}

// Product CRUD Actions
export async function createProduct(prevState: ProductState, formData: FormData) {
  const variationsData = formData.get('variations');
  const variations = variationsData ? JSON.parse(variationsData as string) : [];

  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
    price: formData.get('price'),
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || undefined,
    brandId: formData.get('brandId') || undefined,
    images: formData.get('images') || undefined,
    productType: formData.get('productType'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, slug, description, categoryId, brandId, images, productType } = validatedFields.data;
  let { price, stock } = validatedFields.data;

  // If product is variable, price and stock are 0
  if (productType === 'VARIABLE') {
    price = 0;
    stock = 0;
  }
  price = price ?? 0;
  stock = stock ?? 0;
  // Auto-generate slug from name if not provided
  const finalSlug = slug || await generateUniqueProductSlug(name);

  // Parse images JSON if provided - format: [{url: string, isDefault: boolean}, ...]
  let imagesJson = null;
  if (images && images.trim()) {
    try {
      const parsed = JSON.parse(images);
      // Ensure at least one image is marked as default if images exist
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasDefault = parsed.some((img: any) => img.isDefault);
        if (!hasDefault && parsed.length > 0) {
          parsed[0].isDefault = true;
        }
        imagesJson = parsed;
      } else {
        imagesJson = [];
      }
    } catch {
      return {
        errors: { images: ['Invalid JSON format for images'] },
        message: 'Invalid images JSON format.',
      };
    }
  }

  try {
    await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        price,
        stock,
        images: imagesJson || [],
        categoryId: categoryId || null,
        brandId: brandId || null,
        productType,
        variants: {
          create: variations.map((variant: any) => ({
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            attributes: variant.attributes,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      // If slug conflict, regenerate and retry once
      const retrySlug = await generateUniqueProductSlug(name);
      try {
        await prisma.product.create({
          data: {
            name,
            slug: retrySlug,
            description: description || null,
            price,
            stock,
            images: imagesJson || [],
            categoryId: categoryId || null,
            brandId: brandId || null,
            productType,
            variants: {
              create: variations.map((variant: any) => ({
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                attributes: variant.attributes,
              })),
            },
          },
        });
      } catch (retryError) {
        return {
          message: 'Database Error: Failed to Create Product.',
        };
      }
    } else {
      return {
        message: 'Database Error: Failed to Create Product.',
      };
    }
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function updateProduct(id: string, prevState: ProductState, formData: FormData) {
  const variationsData = formData.get('variations');
  const variations = variationsData ? JSON.parse(variationsData as string) : [];
  const validatedFields = UpdateProduct.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
    price: formData.get('price'),
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || undefined,
    brandId: formData.get('brandId') || undefined,
    images: formData.get('images') || undefined,
    productType: formData.get('productType'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, slug, description, categoryId, brandId, images, productType } = validatedFields.data;
  let { price, stock } = validatedFields.data;

  // Get current product to check if name changed
  const currentProduct = await prisma.product.findUnique({ where: { id } });
  if (!currentProduct) {
    return {
      message: 'Product not found.',
    };
  }

  // Auto-generate slug from name if not provided or if name changed
  const finalSlug = slug || (currentProduct?.name !== name
    ? await generateUniqueProductSlug(name, id)
    : currentProduct.slug);

  // If product is variable, price and stock are 0
  if (productType === 'VARIABLE') {
    price = 0;
    stock = 0;
  }

  // Parse images JSON if provided - format: [{url: string, isDefault: boolean}, ...]
  let imagesJson = undefined;
  if (images && images.trim()) {
    try {
      const parsed = JSON.parse(images);
      // Ensure at least one image is marked as default if images exist
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasDefault = parsed.some((img: any) => img.isDefault);
        if (!hasDefault) {
          parsed[0].isDefault = true;
        }
        imagesJson = parsed;
      } else {
        imagesJson = [];
      }
    } catch {
      return {
        errors: { images: ['Invalid JSON format for images'] },
        message: 'Invalid images JSON format.',
      };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updateData: any = {
        name,
        slug: finalSlug,
        description: description || null,
        price: price,
        stock: stock,
        categoryId: categoryId || null,
        brandId: brandId || null,
        productType,
      };
      if (imagesJson !== undefined) {
        updateData.images = imagesJson;
      }

      await tx.product.update({
        where: { id },
        data: updateData,
      });

      if (productType === 'VARIABLE') {
        const existingVariants = await tx.variant.findMany({ where: { productId: id } });
        const existingVariantIds = existingVariants.map((v) => v.id);
        const incomingVariantIds = variations.map((v: any) => v.id).filter(Boolean);

        // Delete variants that are no longer present
        const variantsToDelete = existingVariantIds.filter((variantId) => !incomingVariantIds.includes(variantId));
        if (variantsToDelete.length > 0) {
          await tx.variant.deleteMany({ where: { id: { in: variantsToDelete } } });
        }

        // Create or update variants
        for (const variant of variations) {
          if (variant.id) {
            // Update existing variant
            await tx.variant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                attributes: variant.attributes,
              },
            });
          } else {
            // Create new variant
            await tx.variant.create({
              data: {
                productId: id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                attributes: variant.attributes,
              },
            });
          }
        }
      } else {
        // If the product is simple, delete all existing variants
        await tx.variant.deleteMany({ where: { productId: id } });
      }
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      // If slug conflict, regenerate and retry once
      const retrySlug = await generateUniqueProductSlug(name, id);
      try {
        await prisma.$transaction(async (tx) => {
          const retryUpdateData: any = {
            name,
            slug: retrySlug,
            description: description || null,
            price,
            stock,
            categoryId: categoryId || null,
            brandId: brandId || null,
          };
          if (imagesJson !== undefined) {
            retryUpdateData.images = imagesJson;
          }
          await tx.product.update({
            where: { id },
            data: retryUpdateData,
          });

          if (productType === 'VARIABLE') {
            const existingVariants = await tx.variant.findMany({ where: { productId: id } });
            const existingVariantIds = existingVariants.map((v) => v.id);
            const incomingVariantIds = variations.map((v: any) => v.id).filter(Boolean);

            // Delete variants that are no longer present
            const variantsToDelete = existingVariantIds.filter((variantId) => !incomingVariantIds.includes(variantId));
            if (variantsToDelete.length > 0) {
              await tx.variant.deleteMany({ where: { id: { in: variantsToDelete } } });
            }

            // Create or update variants
            for (const variant of variations) {
              if (variant.id) {
                // Update existing variant
                await tx.variant.update({
                  where: { id: variant.id },
                  data: {
                    name: variant.name,
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.stock,
                    attributes: variant.attributes,
                  },
                });
              } else {
                // Create new variant
                await tx.variant.create({
                  data: {
                    productId: id,
                    name: variant.name,
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.stock,
                    attributes: variant.attributes,
                  },
                });
              }
            }
          } else {
            // If the product is simple, delete all existing variants
            await tx.variant.deleteMany({ where: { productId: id } });
          }
        });
      } catch (retryError) {
        return {
          message: 'Database Error: Failed to Update Product.',
        };
      }
    } else {
      return {
        message: 'Database Error: Failed to Update Product.',
      };
    }
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete product.');
  }
  revalidatePath('/dashboard/products');
}

// Coupon CRUD Actions
export async function createCoupon(prevState: CouponState, formData: FormData) {
  const validatedFields = CreateCoupon.safeParse({
    code: formData.get('code'),
    description: formData.get('description') || undefined,
    discountType: formData.get('discountType'),
    discountValue: formData.get('discountValue'),
    minOrderValue: formData.get('minOrderValue') || undefined,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    expiresAt: formData.get('expiresAt') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Coupon.',
    };
  }

  const { code, description, discountType, discountValue, minOrderValue, isActive, expiresAt } = validatedFields.data;

  try {
    await prisma.coupon.create({
      data: {
        code,
        description: description || null,
        discountType,
        discountValue,
        minOrderValue: minOrderValue || null,
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      return {
        message: 'Coupon code already exists. Please use a different code.',
        errors: { code: ['Code must be unique'] },
      };
    }
    return {
      message: 'Database Error: Failed to Create Coupon.',
    };
  }

  revalidatePath('/dashboard/coupons');
  redirect('/dashboard/coupons');
}

export async function updateCoupon(id: string, prevState: CouponState, formData: FormData) {
  const validatedFields = UpdateCoupon.safeParse({
    code: formData.get('code'),
    description: formData.get('description') || undefined,
    discountType: formData.get('discountType'),
    discountValue: formData.get('discountValue'),
    minOrderValue: formData.get('minOrderValue') || undefined,
    isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    expiresAt: formData.get('expiresAt') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Coupon.',
    };
  }

  const { code, description, discountType, discountValue, minOrderValue, isActive, expiresAt } = validatedFields.data;

  try {
    await prisma.coupon.update({
      where: { id },
      data: {
        code,
        description: description || null,
        discountType,
        discountValue,
        minOrderValue: minOrderValue || null,
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
  } catch (error: any) {
    console.error(error);
    if (error?.code === 'P2002') {
      return {
        message: 'Coupon code already exists. Please use a different code.',
        errors: { code: ['Code must be unique'] },
      };
    }
    return {
      message: 'Database Error: Failed to Update Coupon.',
    };
  }

  revalidatePath('/dashboard/coupons');
  redirect('/dashboard/coupons');
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete coupon.');
  }
  revalidatePath('/dashboard/coupons');
}

// Order Actions (Status Update Only)
export async function updateOrderStatus(id: string, prevState: OrderState, formData: FormData) {
  const validatedFields = UpdateOrderStatus.safeParse({
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Order Status.',
    };
  }

  const { status } = validatedFields.data;

  try {
    await prisma.order.update({
      where: { id },
      data: { status },
    });
  } catch (error: any) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Update Order Status.',
    };
  }

  revalidatePath('/dashboard/orders');
  redirect('/dashboard/orders');
}

// Review Actions (Delete Only)
export async function deleteReview(id: string) {
  try {
    await prisma.review.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete review.');
  }
  revalidatePath('/dashboard/reviews');
}
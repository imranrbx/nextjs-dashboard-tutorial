'use client';

import { useMemo, useState, useEffect } from 'react';
import { formatCurrency } from '@/app/lib/currency';

type VariantInput = {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: unknown;
};

type NormalizedVariant = {
  id: string;
  name: string;
  price: number;
  stock: number;
  options: string[];
};

function extractOptions(attributes: unknown): string[] {
  if (!attributes) return [];
  if (Array.isArray(attributes)) {
    return attributes
      .map((attr) => {
        if (typeof attr === 'string') return attr;
        if (attr && typeof attr === 'object' && 'label' in (attr as Record<string, unknown>)) {
          return String((attr as Record<string, unknown>).label);
        }
        return null;
      })
      .filter((value): value is string => Boolean(value));
  }
  if (typeof attributes === 'string') {
    return [attributes];
  }
  return [];
}

type VariableProductOptionsProps = {
  basePrice: number;
  variants: VariantInput[];
  rating: string | null;
  reviewCount: number;
  formId: string;
};

export function VariableProductOptions({
  basePrice,
  variants,
  rating,
  reviewCount,
  formId,
}: VariableProductOptionsProps) {
  const normalizedVariants = useMemo<NormalizedVariant[]>(() => {
    return variants
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: variant.price,
        stock: variant.stock,
        options: extractOptions(variant.attributes),
      }))
      .filter((variant) => variant.options.length > 0);
  }, [variants]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialSelections = normalizedVariants.reduce<Record<string, string>>(
      (acc, variant) => {
        acc[variant.id] = '';
        return acc;
      },
      {},
    );
    setSelectedOptions(initialSelections);
  }, [normalizedVariants]);

  const extraPrice = normalizedVariants.reduce((total, variant) => {
    const selectedValue = selectedOptions[variant.id];
    if (selectedValue) {
      return total + (variant.price || 0);
    }
    return total;
  }, 0);

  const totalPrice = basePrice + extraPrice;

  const serializedSelections = useMemo(() => {
    const selected = normalizedVariants
      .map((variant) => {
        const value = selectedOptions[variant.id];
        if (!value) return null;
        return {
          id: variant.id,
          name: variant.name,
          value,
          price: variant.price || 0,
        };
      })
      .filter(
        (item): item is {
          id: string;
          name: string;
          value: string;
          price: number;
        } => Boolean(item),
      );
    return JSON.stringify(selected);
  }, [normalizedVariants, selectedOptions]);

  const handleChange = (variantId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-3xl font-semibold text-gray-900">
            {formatCurrency(totalPrice)}
          </p>
          {rating && (
            <p className="text-sm text-gray-600">
              ⭐ {rating} ({reviewCount} reviews)
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Base price {formatCurrency(basePrice)}{' '}
          {extraPrice > 0
            ? `+ variations ${formatCurrency(extraPrice)}`
            : '(select options to add variation pricing)'}
        </p>
      </div>

      {normalizedVariants.length > 0 ? (
        <div className="space-y-4">
          {normalizedVariants.map((variant) => (
            <label key={variant.id} className="block text-sm font-medium text-gray-900">
              {variant.name}
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={selectedOptions[variant.id] ?? ''}
                onChange={(event) => handleChange(variant.id, event.target.value)}
              >
                <option value="">Select {variant.name}</option>
                {variant.options.map((option) => (
                  <option key={option} value={option}>
                    {option}{' '}
                    {variant.price > 0
                      ? `( +${formatCurrency(variant.price)} )`
                      : ''}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-gray-500">
                {variant.stock > 0 ? `${variant.stock} units available` : 'Out of stock'}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Variations will appear here once they are configured for this product.
        </p>
      )}
      <input
        type="hidden"
        form={formId}
        name="variantSelections"
        value={serializedSelections}
        readOnly
      />
    </div>
  );
}


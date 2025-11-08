import { JsonValue } from "@/app/generated/prisma/runtime/library"
import Image from "next/image"
type ImageType = {
    url: string
    isDefault?: boolean
}
const Thumbnail = ({ images }: { images: JsonValue }) => {
    const imageArray = Array.isArray(images) ? (images as ImageType[]) : []
    const defaultImage = imageArray.find((image) => image.isDefault)
    const url = defaultImage ? defaultImage.url : '/uploads/products/placeholder.png'
    return (
        <Image src={url} width={75} height={45} alt="Product Thumbnail" />
    )
}
export default Thumbnail
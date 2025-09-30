import Image from "next/image"

const loading = () => {
  return (
    <div className="min-h-screen flex justify-center items-center">
    <Image src="/loader.gif" alt="loading" width={100} height={100} className="mx-auto my-20" priority/>
    </div>
  )
}
export default loading
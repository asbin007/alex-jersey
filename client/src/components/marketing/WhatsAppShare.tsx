interface Props {
  productName: string
  productUrl: string
  price: number
}

/** Inline WhatsApp share button — place on product detail or order confirmation */
export default function WhatsAppShare({ productName, productUrl, price }: Props) {
  const msg = encodeURIComponent(
    `Check out this jersey I found at Alex Jersey Shop!\n${productName} — Rs.${price.toLocaleString()}\n${productUrl}\nCash on Delivery available 🇳🇵`
  )

  return (
    <a
      href={`https://wa.me/?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/25 bg-[#25D366]/8 px-4 py-2 text-xs font-black text-[#25D366] transition-all hover:bg-[#25D366]/16"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L.057 23.093a.75.75 0 0 0 .925.919l5.179-1.469A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.5-5.24-1.374l-.375-.215-3.873 1.098 1.114-3.785-.232-.384A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
      Share on WhatsApp
    </a>
  )
}

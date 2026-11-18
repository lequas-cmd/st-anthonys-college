import collegeLogo from '../../assets/images/college-logo.png'

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark">
        <img src={collegeLogo} alt="Saint Anthony's Technical and Vocational College logo" />
      </div>
      <div>
        <span className="brand-name">Saint Anthony's</span>
        <span className="brand-sub">Technical and Vocational College</span>
      </div>
    </div>
  )
}


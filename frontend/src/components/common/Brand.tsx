import collegeLogo from '../../assets/images/college-logo.png'

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark">
        <img src={collegeLogo} alt="Saint Anthony's College Crest" />
      </div>
      <div className="brand-text">
        <span className="brand-name">Saint Anthony's</span>
        <span className="brand-sub">Technical &amp; Vocational College</span>
      </div>
    </div>
  )
}

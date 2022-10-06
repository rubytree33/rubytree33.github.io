import _ from 'lodash'

const Logo = ({ className = '', size = 32, alt = 'rubytree' }) => {
  const turn = 2*Math.PI  // full turn in radians
  const PHI = (Math.sqrt(5)+1)/2  // golden ratio
  // arc (radians) <-> subtended segment length (in unit circle)
  const seglen = (a: number) => 2*Math.sin(a/2)
  const segleninv = (a: number) => Math.asin(a/2)*2

  const arcSign = 1  // 1 = cw, -1 = ccw
  const nFacets = 3  // number of facet segments at the top
  const facetsStart = 1/2*turn  // alignment of start of facets
  const facetsAngle = (1-1/PHI)*turn  // angle used by facets
  const facetRatio = 1/PHI  // ratio of top facet length to facet rim
  const strokeWidth = 1/32  // ruby stroke width
  const outlineWidth = 0  // circle outline stroke width
  const outlinePad = 1/8  // pad between circle outline and ruby

  const topFacetAngle = segleninv(facetRatio * seglen(facetsAngle))
  const sideFacetAngle = (facetsAngle-topFacetAngle)/2

  // coordinates for the <path>
  const coords =
    // vertices in radians
    [
      0,  // start
      sideFacetAngle,  // first facet
      sideFacetAngle + topFacetAngle,  // second facet
      facetsAngle,  // third facet
      (facetsAngle + turn) / 2,  // bottom point (halfway)
      turn,  // return to start
    ]
    // vertex coordinates on unit circle
    .map(rad => {
      rad = arcSign * (facetsStart + rad)  // align and reorient
      return [Math.cos(rad), Math.sin(rad)]  // to unit circle coords
    })
    // reposition within viewbox
    .map(coordPair => coordPair.map(xI => {
      xI = xI / 2  // rescale for viewbox
      xI = xI * (1 - outlinePad*2)  // pad for outline
      xI = xI + 1/2  // center in viewbox
      xI = xI * (1 - outlineWidth) + outlineWidth/2 // pad for stroke
      xI = xI * size  // actual size
      xI = Math.round(xI * 1e12) / 1e12  // truncate precision to avoid hydration discrepancy
      return xI
    }))

  // sequence of coordinates -> <path> instructions
  const toD = (coords: number[][]) =>
    "M" + coords.map(([x,y])=>x+" "+y).join("L")

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        role='img' aria-label={alt}
        className={className}>
      <desc>{alt}</desc>
      <circle className="stroke-ruby-50 fill-ruby-500"
        cx="50%" cy="50%"
        r={size*(1-outlineWidth)/2} strokeWidth={size*outlineWidth} />
      <path className="fill-transparent stroke-ruby-50"
        strokeLinejoin="round" strokeLinecap="round"
        strokeWidth={size*strokeWidth}
        d={""
          + toD(coords) + "Z"  // gem outline, closed
          + toD([coords[0], coords[nFacets]])  // rim
          + toD([coords[1], coords.at(-2) as number[], coords[nFacets-1]])  // segments to bottom point
        } />
    </svg>
  )
}

export default Logo

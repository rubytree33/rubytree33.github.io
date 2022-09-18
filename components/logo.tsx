import _ from 'lodash'

const Logo = ({ className = "" }) => {
  const size = 32

  const nFacets = 3
  // units are coords 0 0 to 1 1, full turn = 1
  const arcSign = 1  // 1 = cw, -1 = ccw
  const startFrac = 1/2  // alignment of start of facets
  const arcLength = 2/5  // arc length used by facets
  const strokeWidth = 1/32
  const pad = 1/8  // distance of vertices from circumscribing circle

  const coords =
    _.range(nFacets + 1)  // vertices of the facets
      .map(i => i/nFacets * arcLength)  // distribute evenly
      .concat([(1 + arcLength) / 2, 1])  // add bottom of ruby and close path
      .map(frac => arcSign * Math.PI*2 * (startFrac + frac))  // to radians
      .map(rad => [Math.cos(rad), Math.sin(rad)])  // to unit circle coords
    .map(coordPair => coordPair
      .map(xI => xI / 2)  // rescale for viewbox
      .map(xI => xI * (1 - pad*2))  // pad
      .map(xI => xI + 1/2)  // center in viewbox
      .map(xI => xI * (1 - strokeWidth) + strokeWidth/2) // pad for stroke
      .map(xI => xI * size)  // actual size
    )

  const toD = (coords: number[][]) =>
    "M" + coords.map(([x,y])=>x+" "+y).join("L")

  // just one path for now
  const pathD = ""
    + toD(coords)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className={className + " stroke-ruby-500 fill-ruby-500"}>
      <circle cx="50%" cy="50%"
        r={size*(1-strokeWidth)/2} strokeWidth={size*strokeWidth} />
      <path fill="transparent" stroke="white" strokeLinejoin="round"
        d={pathD} strokeWidth={size*strokeWidth} />
    </svg>
  )
}

export default Logo

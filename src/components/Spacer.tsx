
interface SpacerProps {
    size?: number;
}
const Spacer = ({ size = 16 }: SpacerProps) => {
  return <div style={{ height: size }}></div>
}

export default Spacer

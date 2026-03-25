import { UI_ASSETS } from "../assets/ui";
import { PixelText } from "../ui";

type TravelLoadingOverlayProps = {
  destinationLabel: string;
};

export default function TravelLoadingOverlay({ destinationLabel }: TravelLoadingOverlayProps) {
  return (
    <div className="travel-overlay" role="status" aria-live="polite">
      <div className="travel-overlay-content">
        <PixelText variant="body">Viajando a {destinationLabel}...</PixelText>
        <div className="travel-road">
          <img src={UI_ASSETS.busLoaderUrl} alt="Bus en movimiento" className="travel-bus" />
        </div>
      </div>
    </div>
  );
}


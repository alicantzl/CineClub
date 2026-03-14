import React from 'react';

interface LottiePlayerProps {
  src: string;
  stateMachineId?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({
  src,
  stateMachineId,
  width = 300,
  height = 300,
  className,
  autoplay = true,
  loop = true
}) => {
  return (
    <div className={className} style={{ width, height, pointerEvents: 'none' }}>
      {/* @ts-expect-error - Custom element dotlottie-wc is loaded from script tag */}
      <dotlottie-wc
        src={src}
        stateMachineId={stateMachineId}
        autoplay={autoplay}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottiePlayer;

'use client';

const Illustration = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 450 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="illustration-title"
      role="img"
      {...props}
    >
      <title id="illustration-title">A cheerful character celebrating finding a job</title>
      <g transform="translate(50, 20)">
        {/* Character */}
        <g transform="translate(100, 50)">
          {/* Head */}
          <circle cx="75" cy="40" r="30" fill="#F8F8F8" stroke="#333333" strokeWidth="3" />
          {/* Eyes */}
          <circle cx="65" cy="35" r="2" fill="#333333" />
          <circle cx="85" cy="35" r="2" fill="#333333" />
          {/* Smile */}
          <path d="M 70 50 Q 75 58, 80 50" stroke="#333333" strokeWidth="2" fill="none" />
          {/* Hair */}
          <path d="M 50 20 Q 75 0, 100 20 L 105 40 L 45 40 Z" fill="#333333" />
  
          {/* Body */}
          <rect x="50" y="70" width="50" height="80" rx="10" fill="#F8F8F8" stroke="#333333" strokeWidth="3" />
          
          {/* Legs */}
          <rect x="55" y="150" width="15" height="60" rx="5" fill="#008080" />
          <rect x="80" y="150" width="15" height="60" rx="5" fill="#008080" />
           {/* Shoes */}
          <path d="M 50 210 L 70 210 L 75 220 L 45 220 Z" fill="#333333" />
          <path d="M 75 210 L 95 210 L 100 220 L 70 220 Z" fill="#333333" />
  
          {/* Arms */}
          <path d="M 50 80 C 20 90, 20 130, 45 130" stroke="#333333" strokeWidth="3" fill="none" />
          <path d="M 100 80 C 130 70, 150 100, 120 120 L 130 90" stroke="#333333" strokeWidth="3" fill="none" />
        </g>
  
        {/* Document */}
        <g transform="translate(180, 0) rotate(15)">
            <rect x="0" y="0" width="50" height="70" rx="5" fill="#008080" stroke="#333333" strokeWidth="2" />
            <path d="M 10 20 L 40 20" stroke="#F8F8F8" strokeWidth="3" />
            <path d="M 10 35 L 25 35" stroke="#F8F8F8" strokeWidth="3" />
            <path d="M 30 30 L 40 40 L 20 50 Z" fill="#F8F8F8" transform="translate(5, 5)" />
        </g>
  
        {/* Decorative elements */}
        <g fill="#008080" opacity="0.5">
            <path d="M 50 150 C 60 120, 90 120, 100 150 L 120 250 L 30 250 Z" opacity="0.7" transform="translate(-50, 0)"/>
            <circle cx="20" cy="100" r="5" />
            <circle cx="250" cy="60" r="3" />
            <circle cx="30" cy="20" r="4" />
            <path d="M 230 150 L 235 155 L 230 160 Z" />
            <path d="M 40 180 L 45 175 L 50 180 L 45 185 Z" />
        </g>
      </g>
    </svg>
  );
  
export default Illustration;

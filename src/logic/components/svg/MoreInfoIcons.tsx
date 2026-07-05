const MoreInfoIcons = ({ expanded }: { expanded: boolean }) => (
  <span className="tooltip tooltip-left" data-tip={expanded ? 'Collapse' : 'Expand'}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`size-5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  </span>
);

export default MoreInfoIcons;

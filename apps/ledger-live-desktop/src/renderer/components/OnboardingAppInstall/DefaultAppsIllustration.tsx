import React, { SVGProps } from "react";

const DefaultAppsIllustration = (props: SVGProps<SVGSVGElement>) => (
  <svg width={108} height={52} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <mask
      id="a"
      style={{
        maskType: "alpha",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={76}
      height={52}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M52 48c13.255 0 24-10.745 24-24S65.255 0 52 0c-4.907 0-9.47 1.473-13.271 4H0v48h48v-4.332c1.3.218 2.637.332 4 .332ZM28 24c0 11.892 8.65 21.764 20 23.668V4h-9.271C32.262 8.3 28 15.652 28 24Z"
        fill="#C4C4C4"
      />
    </mask>
    <g mask="url(#a)">
      <rect y={4} width={40} height={40} rx={20} fill="#F7931A" />
      <path
        d="M27.07 22.04c.315-2.1-1.286-3.23-3.474-3.985l.71-2.847-1.733-.43-.691 2.771c-.455-.114-.923-.22-1.389-.327l.697-2.79L19.457 14l-.71 2.846c-.376-.086-.747-.17-1.106-.26l.002-.01-2.39-.596-.461 1.85s1.286.296 1.259.314c.702.175.828.64.807 1.008l-.808 3.243c.048.012.11.03.18.058l-.183-.046-1.133 4.544c-.086.213-.304.532-.795.411.018.025-1.26-.314-1.26-.314L12 29.031l2.256.563c.42.105.83.215 1.234.319l-.716 2.879 1.731.431.71-2.847c.473.127.932.245 1.381.358l-.707 2.835L19.62 34l.717-2.873c2.955.56 5.177.334 6.112-2.34.754-2.15-.037-3.393-1.592-4.202 1.133-.26 1.985-1.006 2.213-2.544Zm-3.96 5.553c-.534 2.152-4.159.988-5.334.697l.953-3.815c1.175.294 4.941.874 4.38 3.118Zm.536-5.584c-.488 1.959-3.504.963-4.481.72l.862-3.46c.977.244 4.128.698 3.62 2.74Z"
        fill="#fff"
      />
    </g>
    <mask
      id="b"
      style={{
        maskType: "alpha",
      }}
      maskUnits="userSpaceOnUse"
      x={32}
      y={0}
      width={76}
      height={52}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M84 48c13.255 0 24-10.745 24-24S97.255 0 84 0c-4.907 0-9.47 1.473-13.271 4H32v48h48v-4.332c1.3.218 2.637.332 4 .332ZM60 24c0 11.892 8.65 21.764 20 23.668V4h-9.271C64.262 8.3 60 15.652 60 24Z"
        fill="#C4C4C4"
      />
    </mask>
    <g mask="url(#b)">
      <rect x={32} y={4} width={40} height={40} rx={20} fill="#0EBDCD" />
      <path d="M58.248 23.5 51.999 14l-6.249 9.5L52 27.128l6.248-3.628Z" fill="#fff" />
      <path d="m52 34 6.252-8.651L52 28.976 45.75 25.35l6.25 8.65Z" fill="#fff" />
    </g>
    <rect x={64} y={4} width={40} height={40} rx={20} fill="#8247E5" />
    <path
      d="M89.092 20.694c-.369-.216-.849-.216-1.254 0l-2.879 1.653-1.955 1.078-2.879 1.653c-.368.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V20.19c0-.431.221-.826.627-1.042l2.25-1.258c.37-.216.85-.216 1.256 0l2.25 1.258c.37.216.628.611.628 1.042v1.654l1.956-1.115v-1.653a1.16 1.16 0 0 0-.628-1.042l-4.17-2.372c-.368-.216-.848-.216-1.254 0l-4.244 2.372A1.16 1.16 0 0 0 74 19.076v4.78c0 .431.221.827.627 1.043l4.244 2.372c.369.215.849.215 1.255 0l2.878-1.618 1.955-1.114 2.879-1.617c.369-.216.848-.216 1.254 0l2.251 1.258c.37.215.627.61.627 1.042v2.552c0 .431-.22.826-.627 1.042l-2.25 1.294c-.37.216-.85.216-1.255 0l-2.251-1.258c-.37-.216-.628-.611-.628-1.042v-1.653l-1.955 1.114v1.653c0 .431.221.826.627 1.042l4.243 2.372c.37.216.85.216 1.255 0l4.244-2.372c.369-.216.627-.61.627-1.042v-4.78a1.16 1.16 0 0 0-.627-1.042l-4.28-2.409Z"
      fill="#fff"
    />
  </svg>
);

export default DefaultAppsIllustration;
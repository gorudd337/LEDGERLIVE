import React, { memo } from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  height?: number;
  width?: number;
};

const ApplePay: React.FC<Props> = ({ height = 12, width = 30 }) => (
  <Svg viewBox="0 0 30 12" width={width} height={height}>
    <Path
      fill="#999999"
      d="M6.06383 1.54973C5.72407 1.9549 5.18323 2.27505 4.63652 2.22921C4.56901 1.68133 4.83466 1.09945 5.15021 0.739371C5.48997 0.323105 6.08438 0.0266174 6.56577 0C6.62301 0.570795 6.40212 1.12976 6.0675 1.54603L6.06383 1.54973ZM6.56063 2.3342C5.77323 2.28836 5.09884 2.78447 4.72605 2.78447C4.35326 2.78447 3.77207 2.35638 3.15125 2.36821C2.74563 2.37854 2.34975 2.49562 2.00294 2.70782C1.65613 2.92002 1.37046 3.21995 1.17431 3.57782C0.325268 5.05065 0.954157 7.23031 1.77532 8.42883C2.17745 9.02033 2.65592 9.6732 3.29288 9.65028C3.89316 9.62736 4.13165 9.25619 4.85594 9.25619C5.58023 9.25619 5.79672 9.65028 6.43075 9.63845C7.0912 9.62736 7.5014 9.04696 7.90354 8.45546C8.18875 8.03575 8.41127 7.57613 8.56399 7.09131C8.55299 7.08022 7.29519 6.5952 7.28419 5.1342C7.27318 3.91276 8.2756 3.33087 8.32036 3.29612C7.75458 2.45176 6.87104 2.36008 6.56504 2.33494L6.56063 2.3342ZM11.1148 0.679487V9.57634H12.4856V6.53456H14.3825C16.1159 6.53456 17.334 5.33605 17.334 3.60148C17.334 1.86692 16.1386 0.679487 14.428 0.679487H11.1148ZM12.4856 1.844H14.0655C15.2551 1.844 15.9346 2.48281 15.9346 3.6074C15.9346 4.73198 15.2551 5.37598 14.0597 5.37598H12.4856V1.844ZM19.8371 9.6451C20.6979 9.6451 21.497 9.20592 21.8596 8.50943H21.8874V9.57634H23.1562V5.14824C23.1562 3.86395 22.1369 3.0366 20.568 3.0366C19.1121 3.0366 18.0363 3.87579 17.9996 5.02847H19.2339C19.3359 4.48059 19.84 4.12052 20.5313 4.12052C21.3694 4.12052 21.8397 4.51461 21.8397 5.23919V5.73013L20.1292 5.8329C18.5375 5.92976 17.6767 6.58632 17.6767 7.72791C17.6767 8.8695 18.5536 9.64806 19.8276 9.64806L19.8371 9.6451ZM20.204 8.58928C19.4702 8.58928 19.0086 8.23512 19.0086 7.69316C19.0086 7.1342 19.4563 6.80591 20.3119 6.75712L21.8353 6.66026V7.16229C21.8273 7.99852 21.125 8.59224 20.196 8.59224L20.204 8.58928ZM24.8485 11.9963C26.1855 11.9963 26.8137 11.4787 27.3633 9.92606L29.7703 3.12384H28.376L26.7616 8.3793H26.7329L25.1185 3.12384H23.6853L26.0072 9.60074L25.8832 9.99483C25.6733 10.6603 25.3335 10.919 24.7274 10.919C24.6195 10.919 24.4104 10.9079 24.3252 10.8961V11.9638C24.4959 11.9877 24.668 11.9998 24.8404 12L24.8485 11.9963Z"
    />
  </Svg>
);

export default memo(ApplePay);
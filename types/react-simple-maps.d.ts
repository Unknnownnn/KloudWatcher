declare module 'react-simple-maps' {
  import { ReactNode, MouseEvent } from 'react'

  export interface Geography {
    rsmKey: string;
    properties: {
      name?: string;
      iso_a3?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface GeographiesProps {
    geography: any;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }

  export function Geographies(props: GeographiesProps): JSX.Element;

  export interface GeographyProps {
    geography: Geography;
    style?: {
      default?: any;
      hover?: any;
      pressed?: any;
    };
    [key: string]: any;
  }

  export function Geography(props: GeographyProps): JSX.Element;

  export interface MarkerProps {
    coordinates: [number, number];
    onClick?: (event: MouseEvent) => void;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    style?: any;
    children?: ReactNode;
    [key: string]: any;
  }

  export function Marker(props: MarkerProps): JSX.Element;

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: any;
    width?: number;
    height?: number;
    style?: any;
    children?: ReactNode;
    [key: string]: any;
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element;

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: () => void;
    onMove?: () => void;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    style?: any;
    children?: ReactNode;
    [key: string]: any;
  }

  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;
} 
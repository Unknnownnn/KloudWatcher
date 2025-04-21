"use client"

interface TooltipProps {
  x: number
  y: number
  disaster: {
    name: string
    disaster_type: string
    prediction: string
    status: string
    priority: string
    confidence_score: number
    location: string
    estimated_people_at_risk?: number
  }
}

export default function MapTooltip({ x, y, disaster }: TooltipProps) {
  // Format number with commas
  const formatNumber = (num: number) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "N/A";
  };

  return (
    <div 
      className="fixed pointer-events-none z-50 rounded-md bg-white/95 p-3 shadow-lg"
      style={{ 
        left: `${x}px`,
        top: `${y - 15}px`, // Position slightly above the marker
        transform: 'translate(-50%, -100%)', // Center horizontally, position above vertically
        minWidth: '220px',
        maxWidth: '300px',
        backdropFilter: 'blur(4px)',
        borderBottom: '2px solid #334155', // Add a bottom border for visual appeal
      }}
    >
      {/* Arrow pointing to marker */}
      <div 
        className="absolute h-0 w-0" 
        style={{
          bottom: '-8px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #334155',
        }}
      />
      <div 
        className="absolute h-0 w-0" 
        style={{
          bottom: '-6px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid white',
        }}
      />

      <div className="space-y-2">
        <h3 className="font-bold text-sm truncate border-b pb-1">{disaster.name}</h3>
        
        <div className="text-xs grid gap-1">
          <div className="flex justify-between">
            <span className="font-medium">Type:</span>
            <span className="max-w-[70%] text-right">
              {disaster.disaster_type.charAt(0).toUpperCase() + disaster.disaster_type.slice(1)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Location:</span>
            <span className="max-w-[70%] text-right">{disaster.location}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className={`
              max-w-[70%] text-right font-medium
              ${disaster.status === 'completed' ? 'text-green-600' : 
                disaster.status === 'pending' ? 'text-amber-600' : 
                'text-gray-600'}
            `}>
              {disaster.status.charAt(0).toUpperCase() + disaster.status.slice(1)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Priority:</span>
            <span className={`
              max-w-[70%] text-right font-medium
              ${disaster.priority === 'high' ? 'text-red-600' : 
                disaster.priority === 'medium' ? 'text-orange-600' : 
                'text-yellow-600'}
            `}>
              {disaster.priority.charAt(0).toUpperCase() + disaster.priority.slice(1)}
            </span>
          </div>
          
          {disaster.estimated_people_at_risk !== undefined && (
            <div className="flex justify-between">
              <span className="font-medium">People at risk:</span>
              <span className="max-w-[70%] text-right">
                {formatNumber(disaster.estimated_people_at_risk)}
              </span>
            </div>
          )}
          
          {disaster.confidence_score !== undefined && (
            <div className="mt-1">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Confidence:</span>
                <span className="font-medium">{disaster.confidence_score}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div 
                  className={`h-1.5 rounded-full ${
                    disaster.confidence_score > 80 ? 'bg-green-500' :
                    disaster.confidence_score > 60 ? 'bg-blue-500' :
                    disaster.confidence_score > 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${disaster.confidence_score}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {disaster.prediction && (
            <div className="mt-1">
              <span className="font-medium">Details:</span>
              <p className="mt-0.5 line-clamp-3 text-xs text-gray-700">{disaster.prediction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
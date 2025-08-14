interface Driver {
  givenName: string
  familyName: string
  nationality: string
  code: string
}

interface Constructor {
  name: string
  nationality: string
}

interface Result {
  position: number | null
  positionText: string | null
  driver: Driver
  constructor: Constructor
  points: number | null
  grid: number | null
  laps: number | null
  status: string | null
  timeString: string | null
  fastestLapTime: string | null
}

interface ResultsTableProps {
  results: Result[]
  type: 'race' | 'qualifying' | 'sprint'
}

export default function ResultsTable({ results, type }: ResultsTableProps) {
  const getPositionDisplay = (result: Result) => {
    if (result.position) return result.position
    if (result.positionText) return result.positionText
    return 'DNF'
  }

  const getPositionColor = (position: number | string) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-800'
    if (position === 2) return 'bg-gray-100 text-gray-800'
    if (position === 3) return 'bg-orange-100 text-orange-800'
    if (typeof position === 'number' && position <= 10) return 'bg-green-100 text-green-800'
    return 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pilote
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Équipe
              </th>
              {type === 'race' && (
                <>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps
                  </th>
                </>
              )}
              {type === 'qualifying' && (
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps
                </th>
              )}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPositionColor(getPositionDisplay(result))}`}>
                    {getPositionDisplay(result)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {result.driver.givenName} {result.driver.familyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.driver.code} • {result.driver.nationality}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.constructor.name}</div>
                </td>
                {type === 'race' && (
                  <>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {result.points || '0'}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {result.timeString || '-'}
                      </span>
                    </td>
                  </>
                )}
                {type === 'qualifying' && (
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {result.timeString || '-'}
                    </span>
                  </td>
                )}
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    result.status === 'Finished' || result.status === '+1 Lap' || result.status?.includes('Lap')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status || 'Finished'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
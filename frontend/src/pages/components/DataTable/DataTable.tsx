import type { FC, ReactNode } from 'react'

interface Props {
  headers: string[]
  children: ReactNode
}

const DataTable: FC<Props> = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-lg border bg-[#eeeffc]">
    <table className="w-full text-sm">
      <thead className="bg-primary text-primary-foreground text-left">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-2 font-medium">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)

export default DataTable

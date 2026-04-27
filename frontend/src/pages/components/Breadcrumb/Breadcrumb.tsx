import { Fragment, type FC } from 'react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  navigations: BreadcrumbItem[]
}

const Breadcrumb: FC<Props> = ({ navigations }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
    {navigations.map(({ label, to }, position) => (
      <Fragment key={label}>
        {position > 0 && <span className="text-muted-foreground">/</span>}
        {to ? (
          <Link to={to} className="text-muted-foreground hover:text-foreground">
            {label}
          </Link>
        ) : (
          <span aria-current="page" className="text-foreground font-medium">
            {label}
          </span>
        )}
      </Fragment>
    ))}
  </nav>
)

export default Breadcrumb

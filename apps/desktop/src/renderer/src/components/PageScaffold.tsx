import { preview__PageHeader as PageHeader } from '@carbon/ibm-products'
import { Breadcrumb, BreadcrumbItem, Button, Tag } from '@carbon/react'
import type { ReactNode } from 'react'

type TagItem = { label: string; type?: 'red' | 'green' | 'warm-gray' | 'blue' | 'gray' }

type PageAction = {
  label: string
  kind?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick: () => void
  disabled?: boolean
}

export function PageScaffold({
  title,
  subtitle,
  tags,
  pageActions,
  children,
}: {
  title: string
  subtitle?: ReactNode
  tags?: TagItem[]
  pageActions?: PageAction[]
  children: ReactNode
}) {
  const subtitleText = typeof subtitle === 'string' ? subtitle : undefined
  const actionItems = pageActions?.map((action) => ({
    id: action.label,
    onClick: action.onClick,
    body: (
      <Button kind={action.kind} disabled={action.disabled} size="md">
        {action.label}
      </Button>
    ),
  }))

  return (
    <div className="vz-page">
      <PageHeader.Root>
        <PageHeader.BreadcrumbBar>
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem href="#" onClick={(event) => event.preventDefault()}>
              ViáticoCero
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>{title}</BreadcrumbItem>
          </Breadcrumb>
        </PageHeader.BreadcrumbBar>
        <PageHeader.Content
          title={title}
          contextualActions={
            tags?.length
              ? tags.map((tag) => (
                  <Tag key={tag.label} type={tag.type} size="md">
                    {tag.label}
                  </Tag>
                ))
              : undefined
          }
          pageActions={
            actionItems?.length ? (
              <PageHeader.ContentPageActions
                menuButtonLabel="Acciones"
                actions={actionItems as never}
              />
            ) : undefined
          }
        >
          {subtitle ? (
            <PageHeader.ContentText subtitle={subtitleText}>
              {subtitleText ? null : subtitle}
            </PageHeader.ContentText>
          ) : null}
        </PageHeader.Content>
      </PageHeader.Root>
      <div className="vz-page__body">{children}</div>
    </div>
  )
}

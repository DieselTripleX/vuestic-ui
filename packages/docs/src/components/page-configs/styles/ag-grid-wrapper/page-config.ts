import { ApiDocsBlock } from '../../../../types/configTypes'
import { DocsHelper } from '../../../../helpers/DocsHelper'
import { locale } from '../../../../helpers/I18nHelper'

export default [
  DocsHelper.title('ag-grid-wrapper.title'),
  DocsHelper.paragraph('ag-grid-wrapper.description'),
  DocsHelper.headline('dataTable.related'),
  DocsHelper.link('dataTable.styledTablesLink', `/${locale}/styles/table`),
] as ApiDocsBlock[]

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon as HugeAlertCircleIcon,
  ChartBarLineIcon,
  CheckIcon as HugeCheckIcon,
  Clock01Icon,
  CopyIcon as HugeCopyIcon,
  Delete02Icon,
  Download04Icon,
  ExternalLinkIcon as HugeExternalLinkIcon,
  Link04Icon,
  MouseLeftClick05Icon,
  QrCodeIcon as HugeQrCodeIcon,
  RefreshIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

function createHugeIcon(icon) {
  function Icon({ strokeWidth = 1.75, ...props }) {
    return <HugeiconsIcon icon={icon} strokeWidth={strokeWidth} {...props} />
  }

  return Icon
}

export const AlertCircleIcon = createHugeIcon(HugeAlertCircleIcon)
export const BarChart3Icon = createHugeIcon(ChartBarLineIcon)
export const CheckIcon = createHugeIcon(HugeCheckIcon)
export const ClockIcon = createHugeIcon(Clock01Icon)
export const CopyIcon = createHugeIcon(HugeCopyIcon)
export const DownloadIcon = createHugeIcon(Download04Icon)
export const ExternalLinkIcon = createHugeIcon(HugeExternalLinkIcon)
export const LinkIcon = createHugeIcon(Link04Icon)
export const MousePointerClickIcon = createHugeIcon(MouseLeftClick05Icon)
export const QrCodeIcon = createHugeIcon(HugeQrCodeIcon)
export const RefreshCwIcon = createHugeIcon(RefreshIcon)
export const SearchIcon = createHugeIcon(Search01Icon)
export const TrashIcon = createHugeIcon(Delete02Icon)

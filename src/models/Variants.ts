const variants = ["default", "outline", "danger", "cancelLight", "delete"] as const
type VariantType = typeof variants[number]
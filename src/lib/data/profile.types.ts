import type { ElementType } from "react";

export interface ProfileDetailField {
  label: string;
  value: string;
}

export interface ProfileEmploymentField extends ProfileDetailField {
  badge?: boolean;
}

export interface ProfileSecurityItem {
  icon: ElementType;
  iconColorClass?: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

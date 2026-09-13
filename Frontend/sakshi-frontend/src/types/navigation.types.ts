export interface NavItem {
  label:    string;
  href:     string;
  icon:     string;
  badge?:   boolean;
  children?: NavItem[];
  roles?:   string[];
}

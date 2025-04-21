import { FileText, Settings, Globe } from 'lucide';

export function injectSidebarIcons() {
  const info = FileText({ size: 18 });
  const settings = Settings({ size: 18 });
  const custom = Globe({ size: 18 });

  document.querySelector('#infoBtn .icon')?.appendChild(info);
  document.querySelector('#settingsBtn .icon')?.appendChild(settings);
  document.querySelector('#customBtn .icon')?.appendChild(custom);
}

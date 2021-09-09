const Bytes = imports.byteArray
const GLib  = imports.gi.GLib
const Unite = imports.misc.extensionUtils.getCurrentExtension()

const THEME_DIRS = [
  GLib.build_filenamev([Unite.path, 'themes']),
  GLib.build_filenamev([GLib.get_user_data_dir(), 'unite-shell/themes'])
]

function loadTemplate() {
  const path = GLib.build_filenamev([Unite.path, 'templates', 'theme.css'])
  const data = GLib.file_get_contents(path)

  return Bytes.toString(data[1])
}

function toTitleCase(text) {
  const upcase = (_, char) => char ? char.toUpperCase() : ''
  const string = text.replace(/-|_/g, ' ')

  return string.replace(/\b([a-z])/g, upcase)
}

var WindowControlsTheme = class WindowControlsTheme {
  constructor(uuid) {
    this.uuid = uuid
    this.keys = new GLib.KeyFile()

    this.reload()
  }

  get name() {
    return this.get('Theme', 'Name') || toTitleCase(this.uuid)
  }

  reload() {
    const themePath = `${this.uuid}/unite.theme`
    const [_, path] = this.keys.load_from_dirs(themePath, THEME_DIRS, GLib.KeyFileFlags.NONE)

    this.path = GLib.path_get_dirname(path)
  }

  get(group, key) {
    try {
      return this.keys.get_string(group, key)
    } catch {
      return null
    }
  }

  filePath(file) {
    return GLib.build_filenamev([this.path, file])
  }

  iconSize(key) {
    return this.get('Theme', key) || 16
  }

  iconPath(icon, variant) {
    const file = this.get('Icons', icon)
    const path = this.filePath(file)
    const name = variant && this.get('Variants', variant)

    return name ? path.replace(/\.(png|svg)$/, `-${name}.$1`) : path
  }

  parse() {
    let style = loadTemplate()
    const sub = (key, val) => style = style.replace(`[${key}]`, val)

    sub('width',       this.iconSize('Width'))
    sub('height',      this.iconSize('Height'))

    sub('close',       this.iconPath('Close'))
    sub('closeHover',  this.iconPath('Close', 'Hover'))
    sub('closeActive', this.iconPath('Close', 'Active'))

    sub('min',         this.iconPath('Minimize'))
    sub('minHover',    this.iconPath('Minimize', 'Hover'))
    sub('minActive',   this.iconPath('Minimize', 'Active'))

    sub('max',         this.iconPath('Maximize'))
    sub('maxHover',    this.iconPath('Maximize', 'Hover'))
    sub('maxActive',   this.iconPath('Maximize', 'Active'))

    return style
  }
}

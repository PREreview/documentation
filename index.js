var fs = require('fs')
var path = require('path')

var remark = require('remark')
var recommended = require('remark-preset-lint-recommended')
var html = require('remark-html')
var pipeline = remark().use(recommended).use(html)

var rootdir = __dirname
var outdir = path.join(__dirname, 'dist')

try {
  fs.mkdirSync(outdir)
} catch (e) {
  // console.log(e)
}

var dirs = fs.readdirSync(rootdir)
  .map(fn => path.join(rootdir, fn))
  .map(fp => {
    return {
      filepath: fp,
      stat: fs.statSync(fp)
    }
  })
  .filter(f => 
    f.stat.isDirectory()
    && !(f.filepath.endsWith('.git'))
    && !(f.filepath.endsWith('node_modules'))
    && !(f.filepath.endsWith('images'))
    && !(f.filepath === outdir)
  )
  .map(d => d.filepath)

console.log(dirs)

dirs.map(processDirectory)

function processDirectory (dirpath) {
  console.log('Processing files from', dirpath)
  var markdown = catMdFiles(dirpath)
  var pathparts = dirpath.split('/')
  var outfile = path.join(outdir, pathparts[pathparts.length - 1]) + '.html'

  pipeline.process(markdown, function(err, file) {
    if (err) throw err
    console.log(`Writing HTML to ${outfile}`)
    fs.writeFileSync(outfile, String(file))
  })
}

function catMdFiles (dir) {
  return fs.readdirSync(dir)
    .filter(fn => fn.endsWith('.md'))
    .map(fn => path.join(dir, fn))
    .map(fp => fs.readFileSync(fp))
    .join("\n\n")
}
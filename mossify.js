class Node {
  constructor(id, path) {
    this.id        = id
    this.root      = this
    this.path      = path
    this.x         = null
    this.y         = null
    this.dx        = null
    this.dy        = null
    this.worst     = 0
    this.color     = 'green'
    this.neighbors = new Map()
  }

  find() {
    if(this.root !== this) {
      this.root = this.root.find()
    }

    return this.root
  }

  union(other) {
    const lroot = this.find()
    const rroot = other.find()
    if(lroot !== rroot) {
      lroot.root = rroot
    }
  }
}

class Group extends Node {
  static ALL = new Map()

  static find(path) {
    if(!Group.ALL.has(path)) {
      const id = Group.ALL.size
      Group.ALL.set(path, new Group(id, path))
    }

    return Group.ALL.get(path)
  }

  constructor(id, path) {
    super(id, path)
    this.files = []
  }

  add(file) {
    this.files.push(file)
    for(const [neighbor, weight] of file.neighbors) {
      this.link(neighbor.group, weight)
    }
  }

  link(other, weight) {
    if(other === null) {
      return
    }

    const w = this.neighbors.get(other) || 0
    this.neighbors.set(other, Math.max(w, weight))
    this.union(other)

    if(weight > this.worst) {
      const r = Math.round(128 * weight)
      this.color = 'rgb(' + r + ', ' + (256 - 2*r) + ', ' + (128 - r) + ')'
      this.worst = weight
    }
  }
}

class File extends Node {
  static ALL = new Map()

  static find(path) {
    if(!File.ALL.has(path)) {
      const id = File.ALL.size
      File.ALL.set(path, new File(id, path))
    }

    return File.ALL.get(path)
  }

  constructor(id, path) {
    super(id, path)
    this.group = null
    this.edges = []

    const index = path.lastIndexOf('/')
    if(index > 0) {
      this.group = Group.find(path.slice(0, index))
      this.group.add(this)
    }
  }

  link(other, line, weight) {
    this.edges.push(new Edge(other, line, weight))
    this.neighbors.set(other, weight)
    this.union(other)

    if(this.group) {
      this.group.link(other.group, weight)
    }

    if(weight > this.worst) {
      const r = Math.round(128 * weight)
      this.color = 'rgb(' + r + ', ' + (256 - 2*r) + ', ' + (128 - r) + ')'
      this.worst = weight
    }
  }
}

class Edge {
  constructor(dst, line, match) {
    this.dst   = dst
    this.match = match
    this.line  = line
  }

  get lines() {
    return this.line.lines
  }

  get link() {
    return this.line.link
  }
}

class Line {
  static ALL = []

  constructor(link, file1, match1, file2, match2, lines) {
    this.link   = link
    this.file1  = File.find(file1)
    this.match1 = match1
    this.file2  = File.find(file2)
    this.match2 = match2
    this.lines  = lines
    this.weight = (match1 + match2) / 2

    this.file1.link(this.file2, this, match1)
    this.file2.link(this.file1, this, match2)
    Line.ALL.push(this)
  }
}


function element(type, text, attrs) {
  const node = document.createElement(type)

  if(text !== undefined) {
    node.innerText = text
  }

  if(attrs !== undefined) {
    for (const [k, v] of Object.entries(attrs)) {
      node.setAttribute(k, v)
    }
  }

  return node
}


function mossify_init() {
  function split_file_link(td) {
    const a = td.firstElementChild
    const m = a.innerText.match(/^(.*) \((\d+)%\)$/)

    const path =  m[1]
    const pct  = +m[2] // str to int

    const r    = Math.round(pct * 2.56)
    const td2  = element('td', pct + '%', {
      style: 'color:' + 'rgb(' + r + ', ' + (256 - r) + ', 0)'
    })

    td2.dataset.sort = pct
    a.innerText = path
    td.after(td2)

    return [path, a.href, pct/100]
  }

  const table = document.querySelector('table')
  const thead = element('thead', undefined, {id: 'mossify-table-header'})
  const tbody = table.firstElementChild

  thead.innerHTML = [
    '<tr id="mossify-table-labels">',
      '<th>File 1</th>',
      '<th>%</th>',
      '<th>File 2</th>',
      '<th>%</th>',
      '<th>Lines</th>',
    '</tr>'
  ].join('')

  // Add the new header
  table.id = 'mossify-table'
  table.prepend(thead)

  // Remove the old header
  tbody.removeChild(tbody.firstElementChild)
  tbody.id = 'mossify-table-body'

  // Split the old table cells
  // This also parses the match data
  for(const tr of tbody.children) {
    const td1 = tr.children[0]
    const td2 = tr.children[1]

    const td3 = tr.children[2]
    td3.dataset.sort = td3.innerText

    const [f1, l1, p1] = split_file_link(td1)
    const [f2, l2, p2] = split_file_link(td2)

    new Line(l1, f1, p1, f2, p2, +td3.innerText)
  }
}


function mossify_init_table_sorting() {
  function compare_nums(i) {
    return function(ltr, rtr) {
      const lhs = +ltr.children[i].dataset.sort
      const rhs = +rtr.children[i].dataset.sort

      return rhs - lhs
    }
  }

  function compare_strs(i) {
    return function(ltr, rtr) {
      const lhs = ltr.children[i].innerText
      const rhs = rtr.children[i].innerText

      return lhs.localeCompare(rhs)
    }
  }

  function sort_table(comparator, i) {
    const header = document.getElementById('mossify-table-labels')
    const tbody  = document.getElementById('mossify-table-body')

    const hdr = header.children[i]
    const rev = hdr.classList.contains('sort-dsc')

    for(const th of header.children) {
      th.classList.remove('sort-asc')
      th.classList.remove('sort-dsc')
    }

    const trs = Array.from(tbody.children)
    trs.sort(comparator(i))

    if(rev) {
      hdr.classList.add('sort-asc')
      trs.reverse()
    }
    else {
      hdr.classList.add('sort-dsc')
    }

    trs.forEach(tr => {
      tbody.appendChild(tr)
    })
  }

  const header = document.getElementById('mossify-table-labels')
  header.children[0].addEventListener('click', event => sort_table(compare_strs, 0))
  header.children[1].addEventListener('click', event => sort_table(compare_nums, 1))
  header.children[2].addEventListener('click', event => sort_table(compare_strs, 2))
  header.children[3].addEventListener('click', event => sort_table(compare_nums, 3))
  header.children[4].addEventListener('click', event => sort_table(compare_nums, 4))
}


function mossify_init_table_filtering() {
  const tr = element('tr')
  tr.innerHTML = [
    '<th colspan="999">',
      '<input type="search" id="mossify-table-filter" placeholder="filter by filename" />',
    '</th>'
  ].join('')

  const thead = document.getElementById('mossify-table-header')
  thead.prepend(tr)

  document.getElementById('mossify-table-filter').addEventListener('keyup', event => {
    const tbody   = document.getElementById('mossify-table-body')
    const pattern = event.target.value

    for(const tr of tbody.children) {
      if(tr.innerText.includes(pattern)) {
        tr.style.display = 'table-row'
      }
      else {
        tr.style.display = 'none'
      }
    }
  })
}


function mossify_init_downloading() {
  function download_json(event) {
    if(event.target.getAttribute('href') === '#') {
      const data = Line.ALL.map(line => {return {
        link:   line.link,
        file1:  line.file1.path,
        file2:  line.file2.path,
        match1: line.match1,
        match2: line.match2,
        lines:  line.lines
      }})

      const json = JSON.stringify({matches: data}, undefined, '  ')
      const blob = new Blob([json], {type: 'application/json'})
      event.target.href = window.URL.createObjectURL(blob)
    }
  }

  function download_csv(event) {
    if(event.target.getAttribute('href') === '#') {
      const head = ['File 1,Match 1,File 2,Match 2,Lines']
      const data = head.concat(Line.ALL.map(line => [
        escape_csv(line.link),
        escape_csv(line.file1.path),
        escape_csv(line.file2.path),
        line.match1,
        line.match2,
        line.lines
      ].join(',')))

      const blob = new Blob([data.join('\n')], {type: 'text/csv'})
      event.target.href = window.URL.createObjectURL(blob)
    }
  }

  function escape_csv(str) {
    if(str.includes(',')) {
      return '"' + str.replaceAll('"', '""') + '"'
    }
    else {
      return str
    }
  }

  let curr = document.querySelector('body > a[href$="/scripts.html"]')
  let next = document.createTextNode(' | ')
  curr.after(next)
  curr = next

  next = element('a', 'Download JSON', {href: '#', download: 'moss-results.json'})
  next.addEventListener('click', download_json)
  curr.after(next)
  curr = next

  next = document.createTextNode(' | ')
  curr.after(next)
  curr = next

  next = element('a', 'Download CSV', {href: '#', download: 'moss-results.csv'})
  next.addEventListener('click', download_csv)
  curr.after(next)
  curr = next
}


mossify_init()
mossify_init_table_sorting()
mossify_init_table_filtering()
mossify_init_downloading()
mossify_init_graph_view()

document.body.style.border = "5px solid blue"

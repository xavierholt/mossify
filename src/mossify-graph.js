function mossify_init_graph_view() {
  let Thing    = Group
  let NODES    = Array.from(Thing.ALL.values())
  let SELECTED = undefined
  let ACCENTED = null

  function set_thing(newthing) {
    if(Thing !== newthing) {
      Thing = newthing
      NODES = Array.from(Thing.ALL.values())
      select(null)

      if(Thing.drawn) {
        render(NODES)
      }
      else {
        redraw(NODES, 100, 100)
        Thing.drawn = true
      }
    }
  }

  function add_rows(tbody, file) {
    // helper function for select()
    for(const edge of file.edges) {
      let tr = element('tr')

      let a  = element('a', edge.dst.path, {
        href:   edge.link,
        target: '_blank'
      })

      let td = element('td')
      td.appendChild(a)
      tr.appendChild(td)

      let r = Math.round(256 * edge.match)
      let p = Math.round(100 * edge.match)
      td = element('td', p + '%', {style: 'color:rgb(' + r + ', ' + (256 - r) + ', 0)'})
      tr.appendChild(td)

      td = element('td', '' + edge.lines, {align: 'right'})
      tr.appendChild(td)

      if(Thing === Group) {
        tr.dataset.node_id = edge.dst.group.id
      }
      else {
        tr.dataset.node_id = edge.dst.id
      }

      tbody.appendChild(tr)
    }
  }

  function select(node) {
    if(SELECTED === node) {
      return
    }

    const header = document.querySelector('#mossify-graph-data > h3')
    const tbody  = document.querySelector('#mossify-graph-data > table > tbody')
    while(tbody.firstChild) {
      tbody.removeChild(tbody.firstChild)
    }

    if(node === null) {
      header.innerText = 'Click the graph to select a submission.'
    }
    else if(Thing === File) {
      header.innerText = node.path
      add_rows(tbody, node)
    }
    else {
      header.innerText = node.path
      for(const file of node.files) {
        const tr = element('tr')
        const th = element('th', file.path, {colspan: 3})
        tbody.appendChild(tr)
        tr.appendChild(th)

        add_rows(tbody, file)
      }
    }

    SELECTED = node
    ACCENTED = null
    render(NODES)
    filter()
  }

  function accent(node_id) {
    if(ACCENTED === node_id) {
      return
    }

    ACCENTED = node_id
    for(const tr of graph_table_body.children) {
      const accented = tr.dataset.node_id == node_id
      tr.classList.toggle('accented', accented)
    }

    render(NODES)
  }

  function filter() {
    const pattern = document.getElementById('mossify-graph-filter').value

    for(const tr of graph_table_body.children) {
      const file = tr.children[0]
      if(file.tagName === 'TD') {
        const show = file.innerText.includes(pattern)
        file.classList.toggle('mossify-filtered', !show)
      }
    }
  }

  function render(nodes) {
    if(nodes === null) {
      return
    }

    const modal = canvas.parentElement
    const w = canvas.width  = modal.offsetWidth / 2
    const h = canvas.height = modal.offsetHeight
    // context.clearRect(0, 0, w, h)

    for(const node of nodes) {
      for(const [neighbor, wt] of node.neighbors) {
        if(node.id <= neighbor.id) {
          continue
        }

        context.beginPath()
        context.moveTo(w * node.x,     h * node.y)
        context.lineTo(w * neighbor.x, h * neighbor.y)
        context.closePath()

        const r = Math.round(256 * wt)
        context.strokeStyle = `rgb(${r}, ${256-r}, 0, ${wt})`
        context.stroke()
      }
    }

    const pattern = document.getElementById('mossify-graph-filter').value
    for(const node of nodes) {
      if(node.id == ACCENTED) {
        context.fillStyle = '#ff00ff'
      }
      else if(node === SELECTED) {
        context.fillStyle = '#0000ff'
      }
      else if(node.path.includes(pattern)) {
        context.fillStyle = node.color
      }
      else {
        context.fillStyle = '#dddddd'
      }

      context.fillRect(w * node.x - 5, h * node.y - 5, 10, 10)
    }
  }

  function redraw(nodes, iterations, timeout) {
    let iteration = 1
    const thing = Thing

    cluster(nodes)
    const timer = setInterval(function() {
      iterate(nodes, iteration/iterations)
      center(nodes)

      if(Thing === thing && timeout > 0) {
        render(nodes)
      }

      iteration += 1
      if(iteration >= iterations) {
        clearInterval(timer)
        if(Thing === thing) {
          render(nodes)
        }
      }
    }, timeout)
  }

  // Create the graph view window
  const screen = element('div', undefined, {id: 'mossify-screen'})
  screen.innerHTML = [
    '<div id="mossify-graph-modal" class="showing-groups">',
      '<canvas id="mossify-graph"></canvas>',
      '<div id="mossify-graph-data">',
        '<h3></h3>',
        '<table>',
          '<thead>',
            '<tr>',
              '<td colspan="999">',
                '<input type="search" id="mossify-graph-filter" placeholder="filter by filename" />',
              '</td>',
            '</tr>',
          '</thead>',
          '<tbody></tbody>',
        '</table>',
      '</div>',
      '<div id="mossify-graph-buttons">',
        ' [ ',
        '<span id="mossify-showing-files">Show Files | <a href="#show-groups">Show Groups</a></span>',
        '<span id="mossify-showing-groups"><a href="#show-files">Show Files</a> | Show Groups</span>',
        ' | <a href="#redraw">Redraw</a>',
        ' | <a href="#close">Close</a>',
        ' ] ',
      '</div>',
    '</div>'
  ].join('')

  // Add it to the page
  document.body.appendChild(screen)


  const canvas = document.getElementById('mossify-graph')
  const context = canvas.getContext('2d')

  canvas.addEventListener('click', event => {
    const x = event.offsetX / canvas.offsetWidth
    const y = event.offsetY / canvas.offsetHeight
    const d = 30 / (canvas.offsetWidth + canvas.offsetHeight)

    let best = null
    let dist = d * d

    for(const node of NODES) {
      const dx = node.x - x
      const dy = node.y - y
      const d2 = dx*dx + dy*dy

      if(d2 < dist) {
        best = node
        dist = d2
      }
    }

    select(best)
  })

  document.querySelector('#mossify-graph-buttons a[href="#show-files"]').addEventListener('click', event => {
    const modal = document.getElementById('mossify-graph-modal')
    modal.classList.remove('showing-groups')
    modal.classList.add('showing-files')
    set_thing(File)

    event.stopPropagation()
    event.preventDefault()
  })

  document.querySelector('#mossify-graph-buttons a[href="#show-groups"]').addEventListener('click', event => {
    const modal = document.getElementById('mossify-graph-modal')
    modal.classList.remove('showing-files')
    modal.classList.add('showing-groups')
    set_thing(Group)

    event.stopPropagation()
    event.preventDefault()
  })

  document.querySelector('#mossify-graph-buttons > a[href="#redraw"]').addEventListener('click', event => {
    redraw(NODES, 100, 100)
    event.stopPropagation()
    event.preventDefault()
  })

  document.querySelector('#mossify-graph-buttons > a[href="#close"]').addEventListener('click', event => {
    screen.style.display = 'none'
    event.stopPropagation()
    event.preventDefault()
  })

  document.getElementById('mossify-graph-filter').addEventListener('keyup', event => {
    filter(event.target.value)
    render(NODES)
    event.stopPropagation()
    event.preventDefault()
  })


  const graph_table_body = document.querySelector('#mossify-graph-data > table > tbody')

  graph_table_body.addEventListener('mouseover', event => {
    let tr = event.target
    while(tr && tr.tagName !== 'TR') {
      tr = tr.parentElement
    }

    const node_id = (tr)? tr.dataset.node_id : null
    accent(node_id)
  })

  graph_table_body.addEventListener('mouseleave', event => {
    if(event.target.tagName === 'TBODY') {
      accent(null)
    }
  })

  document.addEventListener('keydown', event => {
    if(event.keyCode === 27) {
      screen.style.display = 'none'
    }
  })

  window.addEventListener('resize', event => {
    if(screen.style.display !== 'none') {
      render(NODES)
    }
  })

  // Add the opener link
  let curr = document.querySelector('body > a[href$="/scripts.html"]')
  let next = document.createTextNode(' | ')
  curr.after(next)
  curr = next

  next = element('a', 'Graph View', {href: '#'})
  next.addEventListener('click', event => {
    screen.style.display = 'block'
    render(NODES)

    event.stopPropagation()
    event.preventDefault()
  })
  curr.after(next)
  curr = next

  // Initialize the graph
  redraw(NODES, 100, 0)
  Thing.drawn = true
  select(null)
}


function center(nodes) {
  let minx = +Infinity
  let maxx = -Infinity
  let miny = +Infinity
  let maxy = -Infinity

  for(const node of nodes) {
    minx = Math.min(node.x, minx)
    maxx = Math.max(node.x, maxx)
    miny = Math.min(node.y, miny)
    maxy = Math.max(node.y, maxy)
  }

  const dx = 0.05 * (maxx - minx)
  const dy = 0.05 * (maxy - miny)

  minx -= dx
  maxx += dx
  miny -= dy
  maxy += dy

  for(const node of nodes) {
    node.x = (node.x - minx) / (maxx - minx)
    node.y = (node.y - miny) / (maxy - miny)
  }
}


function cluster(nodes) {
  const clusters = new Map()
  for(const node of nodes) {
    const root = node.find()

    if(!clusters.has(root)) {
      clusters.set(root, [])
    }

    clusters.get(root).push(node)
  }

  let i = 0
  for(const [root, nodes] of clusters) {
    const r = i / clusters.size
    const a = 2 * Math.PI * r * 3
    const x = Math.cos(a) * (0.5 + 0.5 * r)
    const y = Math.sin(a) * (0.5 + 0.5 * r)

    for(const node of nodes) {
      node.x = x + 0.05 * (0.5 - Math.random())
      node.y = y + 0.05 * (0.5 - Math.random())
    }

    i += 1
  }
}

function clamp(min, val, max) {
  return Math.min(Math.max(val, min), max)
}

function iterate(nodes, throttle) {
  const limit = 0.1 * Math.min(throttle, 1.0)

  // initialize
  for(const node of nodes) {
    node.dx = 0.0
    node.dy = 0.0
  }

  for(let i = nodes.length - 1; i >= 0; --i) {
    const lhs = nodes[i]

    // centering force
    lhs.dx += 0.01 * (0.5 - lhs.x)
    lhs.dy += 0.01 * (0.5 - lhs.y)

    for(let j = i - 1; j >= 0; --j) {
      const rhs = nodes[j]
      const dx  = lhs.x - rhs.x
      const dy  = lhs.y - rhs.y
      const d   = Math.sqrt(dx*dx + dy*dy)

        // spring attraction
      if(lhs.neighbors.has(rhs)) {
        const f = 0.1 * (1.0 - d) // d

        lhs.dx -= f * dx
        lhs.dy -= f * dy
        rhs.dx += f * dx
        rhs.dy += f * dy
      }

      // mutual repulsion
      let   rx = 0.001 * dx/(d*d)
      let   ry = 0.001 * dy/(d*d)
      const r1 = Math.sqrt(rx*rx + ry*ry)

      if(r1 > limit) {
        rx = rx / r1 * limit
        ry = ry / r1 * limit
      }

      lhs.dx += rx
      lhs.dy += ry
      rhs.dx -= rx
      rhs.dy -= ry
    }
  }

  // update
  for(const node of nodes) {
    node.x += node.dx
    node.y += node.dy
  }
}

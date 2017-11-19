import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import queryString from 'query-string'
import './index.css'

const parsed = queryString.parse(window.location.search)
const {src, dest} = parsed

ReactDOM.render(<App {...{src, dest}} />, document.getElementById('root'))

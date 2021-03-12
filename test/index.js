'use strict';
require('chai').should();
const { url_for } = require('hexo-util');

describe('paginator', () => {
  const Hexo = require('hexo');
  const hexo = new Hexo(__dirname);
  global.hexo = hexo;

  const ctx = {
    page: {
      base: '',
      total: 10
    },
    site: hexo.locals,
    config: hexo.config
  };

  const paginator = require('../lib/pagination').bind(ctx);

  function link(i) {
    return url_for.call(ctx, i === 1 ? '' : 'page/' + i + '/');
  }

  function checkResult(result, data) {
    let expected = '';
    const current = data.current;
    const total = data.total;
    const pages = data.pages;
    const space = data.space || '&hellip;';
    const prevNext = Object.prototype.hasOwnProperty.call(data, 'prev_next') ? data.prev_next : true;
    let num;

    if (prevNext && current > 1) {
      expected += '<a class="extend prev" rel="prev" href="' + link(current - 1) + '">Prev</a>';
    }

    for (let i = 0, len = pages.length; i < len; i++) {
      num = pages[i];

      if (!num) {
        expected += '<span class="space">' + space + '</span>';
      } else if (num === current) {
        expected += '<span class="page-number current">' + current + '</span>';
      } else {
        expected += '<a class="page-number" href="' + link(num) + '">' + num + '</a>';
      }
    }

    if (prevNext && current < total) {
      expected += '<a class="extend next" rel="next" href="' + link(current + 1) + '">Next</a>';
    }

    result.should.eql(expected);
  }

  [
    [1, 2, 4, 8, 10],
    [1, 2, 3, 5, 9, 10],
    [1, 2, 3, 4, 6, 10],
    [1, 3, 4, 5, 7, 10],
    [1, 2, 4, 5, 6, 8, 10],
    [1, 3, 5, 6, 7, 9, 10],
    [1, 4, 6, 7, 8, 10],
    [1, 5, 7, 8, 9, 10],
    [1, 2, 6, 8, 9, 10],
    [1, 3, 7, 9, 10]
  ].forEach((pages, i, arr) => {
    const current = i + 1;
    const total = arr.length;

    it('current = ' + current + ', total = 10', () => {
      const result = paginator({
        current,
        total
      });

      checkResult(result, {
        current,
        total,
        pages
      });
    });
  });

  it('current = 1, total = 1024', () => {
    const result = paginator({
      current: 1,
      total: 1024
    });

    checkResult(result, {
      current: 1,
      total: 1024,
      pages: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
    });
  });

  it('current = 1, total = 1023', () => {
    const result = paginator({
      current: 1,
      total: 1023
    });

    checkResult(result, {
      current: 1,
      total: 1023,
      pages: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1023]
    });
  });

  it('current = 1, total = 1025', () => {
    const result = paginator({
      current: 1,
      total: 1025
    });

    checkResult(result, {
      current: 1,
      total: 1025,
      pages: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 1025]
    });
  });

  it('current = 512, total = 1023', () => {
    const result = paginator({
      current: 512,
      total: 1023
    });

    checkResult(result, {
      current: 512,
      total: 1023,
      pages: [1, 257, 385, 449, 481, 497, 505, 509, 511, 512, 513, 515, 519, 527, 543, 575, 639, 767, 1023]
    });
  });

  it('current = 512, total = 1024', () => {
    const result = paginator({
      current: 512,
      total: 1024
    });

    checkResult(result, {
      current: 512,
      total: 1024,
      pages: [1, 257, 385, 449, 481, 497, 505, 509, 511, 512, 513, 515, 519, 527, 543, 575, 639, 767, 1023, 1024]
    });
  });

  it('current = 513, total = 1024', () => {
    const result = paginator({
      current: 513,
      total: 1024
    });

    checkResult(result, {
      current: 513,
      total: 1024,
      pages: [1, 2, 258, 386, 450, 482, 498, 506, 510, 512, 513, 514, 516, 520, 528, 544, 576, 640, 768, 1024]
    });
  });


  it('show_all', () => {
    const result = paginator({
      current: 5,
      show_all: true
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });
  });


  it('base', () => {
    const result = paginator({
      current: 1,
      base: 'archives/'
    });

    result.should.eql([
      '<span class="page-number current">1</span>',
      '<a class="page-number" href="/archives/page/2/">2</a>',
      '<a class="page-number" href="/archives/page/4/">4</a>',
      '<a class="page-number" href="/archives/page/8/">8</a>',
      '<a class="page-number" href="/archives/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/archives/page/2/">Next</a>'
    ].join(''));
  });

  it('format', () => {
    const result = paginator({
      current: 1,
      format: 'index-%d.html'
    });

    result.should.eql([
      '<span class="page-number current">1</span>',
      '<a class="page-number" href="/index-2.html">2</a>',
      '<a class="page-number" href="/index-4.html">4</a>',
      '<a class="page-number" href="/index-8.html">8</a>',
      '<a class="page-number" href="/index-10.html">10</a>',
      '<a class="extend next" rel="next" href="/index-2.html">Next</a>'
    ].join(''));
  });

  it('prev_text / next_text', () => {
    const result = paginator({
      current: 2,
      prev_text: 'Newer',
      next_text: 'Older'
    });

    result.should.eql([
      '<a class="extend prev" rel="prev" href="/">Newer</a>',
      '<a class="page-number" href="/">1</a>',
      '<span class="page-number current">2</span>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<a class="page-number" href="/page/5/">5</a>',
      '<a class="page-number" href="/page/9/">9</a>',
      '<a class="page-number" href="/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/page/3/">Older</a>'
    ].join(''));
  });

  it('prev_next', () => {
    const result = paginator({
      current: 2,
      prev_next: false
    });

    result.should.eql([
      '<a class="page-number" href="/">1</a>',
      '<span class="page-number current">2</span>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<a class="page-number" href="/page/5/">5</a>',
      '<a class="page-number" href="/page/9/">9</a>',
      '<a class="page-number" href="/page/10/">10</a>'
    ].join(''));
  });

  it('transform', () => {
    const result = paginator({
      current: 2,
      transform(page) {
        return 'Page ' + page;
      }
    });

    result.should.eql([
      '<a class="extend prev" rel="prev" href="/">Prev</a>',
      '<a class="page-number" href="/">Page 1</a>',
      '<span class="page-number current">Page 2</span>',
      '<a class="page-number" href="/page/3/">Page 3</a>',
      '<a class="page-number" href="/page/5/">Page 5</a>',
      '<a class="page-number" href="/page/9/">Page 9</a>',
      '<a class="page-number" href="/page/10/">Page 10</a>',
      '<a class="extend next" rel="next" href="/page/3/">Next</a>'
    ].join(''));
  });

  it('context', () => {
    ctx.page.current = 5;
    const result = paginator({
      space: ''
    });

    checkResult(result, {
      current: 5,
      total: 10,
      pages: [1, 2, 4, 5, 6, 8, 10]
    });
  });

  it('current = 0', () => {
    ctx.page.current = 0;
    const result = paginator({});

    result.should.eql('');
  });

  it('escape', () => {
    const result = paginator({
      current: 2,
      prev_text: '<foo>',
      next_text: '<bar>',
      escape: false
    });

    result.should.eql([
      '<a class="extend prev" rel="prev" href="/">',
      '<foo></a>',
      '<a class="page-number" href="/">1</a>',
      '<span class="page-number current">2</span>',
      '<a class="page-number" href="/page/3/">3</a>',
      '<a class="page-number" href="/page/5/">5</a>',
      '<a class="page-number" href="/page/9/">9</a>',
      '<a class="page-number" href="/page/10/">10</a>',
      '<a class="extend next" rel="next" href="/page/3/">',
      '<bar></a>'
    ].join(''));
  });
});



import { parseEntry, getCategory, default as mutate } from './topics'

test('mutate', () => {
  const data = { topics: { first: ['Hello'] }}
  mutate(data)

  expect(data.getTopicCategory).toBeFunction()
  expect(data.topics.first[0].slug).toEqual('hello')
})

test('parseEntry', () => {
  expect(parseEntry('Nue')).toEqual({
    title: "Nue",
    desc: "",
    slug: "nue",
  })

  expect(parseEntry('Foo bar / Some | splat')).toEqual({
    title: "Foo bar",
    desc: "Some",
    slug: "splat",
  })
})

test('getCategory', () => {
  const topics = {
    first: [{ slug: 'foo' }],
    second: [{ slug: 'bar' }],
  }

  expect(getCategory(topics, 'foo')).toBe('first')
})

test('mutate - topics missing', () => {
  const data = {}
  mutate(data)
  expect(data.getTopicCategory).toBeFunction()
  expect(data.getTopicCategory('anything')).toBeUndefined()
})

test('mutate - topics is null', () => {
  const data = { topics: null }
  mutate(data)
  expect(data.getTopicCategory).toBeFunction()
})

test('mutate - topics is a string', () => {
  const data = { topics: 'invalid' }
  mutate(data)
  expect(data.getTopicCategory).toBeFunction()
})

test('mutate - topics is an array', () => {
  const data = { topics: ['invalid'] }
  mutate(data)
  expect(data.getTopicCategory).toBeFunction()
})

test('getCategory - topics missing', () => {
  expect(getCategory(undefined, 'foo')).toBeUndefined()
})

test('getCategory - topics is an array', () => {
  expect(getCategory(['invalid'], 'foo')).toBeUndefined()
})


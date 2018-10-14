import { mount, createLocalVue } from '@vue/test-utils'
import { Tweezing, d3Helper } from '../src'
import timer from './mocks/d3timer'
import { easeLinear } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import Helper from './utils/Helper'

const localVue = createLocalVue()
localVue.use(Tweezing, {
  d3: d3Helper({
    timer,
    interpolate,
    easing: easeLinear,
  }),
})

describe('d3 helper', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(Helper, {
      localVue,
      propsData: {
        to: 0,
      },
      sync: false,
    })
  })

  test('starts right away', () => {
    expect(wrapper.text()).toBe('0')
  })

  test('emits start when starting', async () => {
    const tweezing = wrapper.find(Tweezing)
    expect(tweezing.emitted().start).toBeTruthy()
    expect(tweezing.emitted().start.length).toBe(1)
  })

  test('emits end when ending', () => {
    const tweezing = wrapper.find(Tweezing)
    tweezing.vm.$tween._end()
    expect(tweezing.emitted().end).toBeTruthy()
    expect(tweezing.emitted().end.length).toBe(1)
  })

  describe('sync: false', () => {
    test('accepts an object of values', async () => {
      const wrapper = mount(Helper, {
        localVue,
        propsData: {
          to: { a: 0, b: 0 },
        },
        sync: false,
      })
      const tweezing = wrapper.find(Tweezing)
      wrapper.setProps({ to: { a: 1, b: 1 } })
      expect(wrapper.text()).toBe('{"a":0,"b":0}')
      await wrapper.vm.$nextTick()
      tweezing.vm.$tween.a._end()
      tweezing.vm.$tween.b._end()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('{"a":1,"b":1}')
    })

    test('accepts an array of values', async () => {
      const wrapper = mount(Helper, {
        localVue,
        propsData: {
          to: [0, 0],
        },
        sync: false,
      })
      const tweezing = wrapper.find(Tweezing)
      // tweezing.vm.$tween._start()
      wrapper.setProps({ to: [1, 2] })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('[0,0]')
      tweezing.vm.$tween['0']._end()
      tweezing.vm.$tween['1']._end()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('[1,2]')
    })

    test('stops ongoing tween with a new one', async () => {
      const tweezing = wrapper.find(Tweezing)
      const spy = jest.spyOn(tweezing.vm.$tween, 'stop')
      wrapper.setProps({ to: 1 })
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    test('pass on and use duration prop', async () => {
      wrapper = mount(Helper, {
        localVue,
        propsData: {
          to: 0,
          duration: 500,
        },
        sync: false,
      })
      const tweezing = wrapper.find(Tweezing)
      wrapper.setProps({ to: 1 })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('0')
      // check values at elapsed times less than and greater than duration
      // this assumes linear easing
      tweezing.vm.$tween._elapse(300)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toBe('0')
      expect(wrapper.text()).not.toBe('1')
      tweezing.vm.$tween._elapse(600)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('1')
    })
  })

  test('pass on delay prop', () => {
    wrapper = mount(Helper, {
      localVue,
      propsData: {
        to: 0,
        delay: 500,
      },
    })
    const tweezing = wrapper.find(Tweezing)
    expect(tweezing.vm.$tween.delay).toBe(500)
  })
})

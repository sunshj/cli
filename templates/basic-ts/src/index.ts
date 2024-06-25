function Capitalize(target: any, propertyKey: string) {
  let value = target[propertyKey]

  return Object.defineProperty(target, propertyKey, {
    get() {
      return value
    },
    set(newValue: string) {
      value = newValue.charAt(0).toUpperCase() + newValue.slice(1)
    },
    enumerable: true,
    configurable: true
  })
}

class Person {
  @Capitalize
  name: string = ''

  sayMyName() {
    console.log(`My name is '${this.name}'`)
  }
}

const p = new Person()

p.name = 'sunshj'

p.sayMyName() // My name is 'Sunshj'

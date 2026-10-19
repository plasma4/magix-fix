export default class Camera {
    #world

    #x = 0
    #y = 0
    #width = 0
    #height = 0
    #zoom = 1

    constructor(world) {
        this.#world = world
    }

    set pos(p){
        if (this.#world.paused) return

        this.#x = p[0]
        this.#y = p[1]
        this.#world.update()
    }

    set viewport(v){
        if (this.#world.paused) return

        this.#width = v[0]
        this.#height = v[1]
        this.#world.update()
    }

    set zoom(val) {
        if (this.#world.paused) return

        this.#zoom = val
        this.#world.update()
    }

    get pos(){
        return {
            x: this.#x,
            y: this.#y
        }
    }

    get viewport(){
        return {
            width: this.#width,
            height: this.#height
        }
    }
    
    get zoom(){
        return this.#zoom
    }
}
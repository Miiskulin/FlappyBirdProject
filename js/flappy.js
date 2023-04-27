function newHTMLElement (tagName, className){
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function barrierConstructure (reverseBarrier = false) {
    this.HTMLelement = newHTMLElement('div', 'barreira')

    const barrierExtremity = newHTMLElement('div', 'borda')
    const barrierBody = newHTMLElement('div', 'corpo')
    this.HTMLelement.appendChild(reverseBarrier ? barrierBody:barrierExtremity)
    this.HTMLelement.appendChild(reverseBarrier ? barrierExtremity:barrierBody)

    this.setHeight = height => barrierBody.style.height = `${height}px`
}

function raffleBarrierHeight(height, openningBetweenExtremeties, highBarrier, bottomBarrier){
    const higherHeight = Math.random() * (height - openningBetweenExtremeties)
    const bottomHeight = height - openningBetweenExtremeties - higherHeight
    highBarrier.setHeight(higherHeight)
    bottomBarrier.setHeight(bottomHeight)
}

function barrierPairsConstructure(height, openning, x) {          // todos os atributos com .this podem ser acessados de fora da function
    this.HTMLelement = newHTMLElement('div', 'par-de-barreiras')

    this.highBarrier = new barrierConstructure(true)
    this.bottomBarrier = new barrierConstructure(false)

    this.HTMLelement.appendChild(this.highBarrier.HTMLelement) 
    this.HTMLelement.appendChild(this.bottomBarrier.HTMLelement)

    this.getXAxis = () => parseInt(this.HTMLelement.style.left.split('px')[0]) // retornar exatamente qual é a posição x daquela barreira
    this.setXAxis = x => this.HTMLelement.style.left = `${x}px`
    this.getweight = () => this.HTMLelement.clientWidth

    raffleBarrierHeight(height, openning, this.highBarrier, this.bottomBarrier)
    this.setXAxis(x)
}


// PAREI DE LIMPAR AQUI - no atributo pares


function createBarriers(height, weight, openning, distanceBetweenBarriers, alterPoints) {
    this.pares = [
        new barrierPairsConstructure(height,openning, weight),
        new barrierPairsConstructure(height,openning, weight + distanceBetweenBarriers),
        new barrierPairsConstructure(height,openning, weight + distanceBetweenBarriers * 2),
        new barrierPairsConstructure(height,openning, weight + distanceBetweenBarriers * 3)
    ]

    const gameSpeed = 7
    this.barrierAnimation = () => {
        this.pares.forEach(par => {
            par.setXAxis(par.getXAxis() - gameSpeed)

            // Quando o elemento sair da tela
            if (par.getXAxis() < -par.getweight()) {
                par.setXAxis(par.getXAxis() + distanceBetweenBarriers * this.pares.length)
                par.raffleBarrierHeight()
            }

            const meio = weight / 2
            const cruzouOMeio = par.getXAxis() + gameSpeed >= meio && par.getXAxis() < meio
            if(cruzouOMeio) alterPoints() 
        })
    }
}




function passaro (alturaJogo) {
    let voando = false
    
    this.HTMLelement = newHTMLElement('img', 'passaro')
    this.HTMLelement.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.HTMLelement.style.bottom.split('px')[0])
    this.setY = y => this.HTMLelement.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false


    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5) //se estiver voando soma 8 se estiver cainso ele vai decrementar 5
        const alturaMaxima = alturaJogo - this.HTMLelement.clientHeight //altura do próprio elemento

        if(novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
    }
    }

    this.setY(alturaJogo / 2)
}

function progresso() {
    this.HTMLelement= newHTMLElement('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.HTMLelement.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect() // Pegando o retângulo associado
    const b = elementoB.getBoundingClientRect() // Pegando o retângulo associado

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical //verdadeiro
}

function colidiu(passaro, createBarriers) {
    let colidiu = false
    createBarriers.pares.forEach(barrierPairs => {
        if (!colidiu) {
            const superior = barrierPairs.highBarrier.HTMLelement
            const inferior = barrierPairs.bottomBarrier.HTMLelement
            colidiu = estaoSobrepostos(passaro.HTMLelement, superior)
               || estaoSobrepostos(passaro.HTMLelement, inferior)
        }
    })
    return colidiu

}



function FlappyBird() {
    let pontos = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const gameHeight = gameArea.clientHeight
    const gameWidth = gameArea.clientWidth

    const gameProgress = new progresso()
    const gameBarrier = new createBarriers(gameHeight, gameWidth, 200, 400, 
        () => gameProgress.atualizarPontos(++pontos))

    const Passaro = new passaro(gameHeight)

    gameArea.appendChild(gameProgress.HTMLelement)
    gameArea.appendChild(Passaro.HTMLelement)
    gameBarrier.pares.forEach(par => gameArea.appendChild(par.HTMLelement))

    this.start = () => {
        // Loop do jogo
        const temporizador = setInterval(() => {
            gameBarrier.barrierAnimation()
            Passaro.animar()

            if(colidiu(Passaro, gameBarrier)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()
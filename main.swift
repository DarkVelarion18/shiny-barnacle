import SpriteKit
import GameplayKit
import GameKit

class GameScene: SKScene {

    var player: SKSpriteNode?
    var scoreLabel: SKLabelNode?
    var score: Int = 0 {
        didSet {
            scoreLabel?.text = "Score: \(score)"
        }
    }
    var bullet: SKSpriteNode?
    var invaders: [SKSpriteNode] = []

    let playerSpeed: CGFloat = 30.0
    let bulletSpeed: CGFloat = 10.0
    let invaderSpeed: CGFloat = 2.0
    var bulletState: String = "ready"
    
        
}
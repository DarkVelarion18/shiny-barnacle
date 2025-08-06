import SpriteKit
import GameplayKit
import Foundation
import GameKit

class GameScene: SKScene {

    var player: SKSpriteNode!
    var scoreLabel: SKLabelNode!
    var score: Int = 0 {
        didSet {
            scoreLabel.text = "Score: \(score)"
        }
    }
    var bullet: SKSpriteNode!
    var invaders: [SKSpriteNode] = []

    
}
import SpriteKit
import GameplayKit
import Foundation
import GameKit

class GameScene: SKScene {

    var player: SKScene!
    var scoreLabel: SKLabelNode!
    var score: Int = 0 {
        didSet {
            scoreLabel.text = "Score: \(score)"
        }
    }
}
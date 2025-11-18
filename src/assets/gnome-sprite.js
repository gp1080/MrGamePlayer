// Gnome Sprite Generator
// Creates ugly gnome characters for the game

export class GnomeSprite {
    constructor(scene, x, y, color = 0x8B4513) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
        this.sprite = null;
    }

    create() {
        // Create a group for the gnome parts
        this.sprite = this.scene.add.group();
        
        // Body (main circle)
        const body = this.scene.add.circle(this.x, this.y, 12, this.color);
        this.sprite.add(body);
        
        // Head (smaller circle)
        const head = this.scene.add.circle(this.x, this.y - 8, 8, 0xFFDBAC); // Skin color
        this.sprite.add(head);
        
        // Hat (pointed hat)
        const hat = this.scene.add.triangle(this.x, this.y - 15, 0, 0, -6, 8, 6, 8, 0xFF0000); // Red hat
        this.sprite.add(hat);
        
        // Eyes (ugly eyes)
        const leftEye = this.scene.add.circle(this.x - 3, this.y - 10, 2, 0x000000);
        const rightEye = this.scene.add.circle(this.x + 3, this.y - 10, 2, 0x000000);
        this.sprite.add(leftEye);
        this.sprite.add(rightEye);
        
        // Nose (big ugly nose)
        const nose = this.scene.add.circle(this.x, this.y - 6, 3, 0xFF69B4); // Pink nose
        this.sprite.add(nose);
        
        // Beard (messy beard)
        const beard = this.scene.add.ellipse(this.x, this.y + 2, 10, 6, 0x654321); // Brown beard
        this.sprite.add(beard);
        
        // Arms (stick arms)
        const leftArm = this.scene.add.rectangle(this.x - 15, this.y - 2, 8, 2, this.color);
        const rightArm = this.scene.add.rectangle(this.x + 15, this.y - 2, 8, 2, this.color);
        this.sprite.add(leftArm);
        this.sprite.add(rightArm);
        
        // Legs (short legs)
        const leftLeg = this.scene.add.rectangle(this.x - 5, this.y + 8, 3, 6, this.color);
        const rightLeg = this.scene.add.rectangle(this.x + 5, this.y + 8, 3, 6, this.color);
        this.sprite.add(leftLeg);
        this.sprite.add(rightLeg);
        
        return this.sprite;
    }

    setPosition(x, y) {
        if (this.sprite) {
            // Move all children of the group to the new position
            this.sprite.children.entries.forEach(child => {
                child.setPosition(x, y);
            });
        }
    }

    setVisible(visible) {
        if (this.sprite) {
            this.sprite.setVisible(visible);
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}

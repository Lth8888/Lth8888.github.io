const MyBg = function(options) {
    options.e_dist = undefined;
    this.faBoxName = options.faBoxId;
    this.faBox = document.getElementById(options.faBoxId);
    this.Context = null;
    this.ball_w = options.ball_w || 2;
    this.ball_h = options.ball_h || 2;
    this.ball_color = options.ball_color || '0, 117, 183';
    this.ball_count = options.ball_count || 200;
    this.ball_points = [];
    this.line_color = options.line_color || '35, 171, 242';
    this.line_conn = options.line_conn || 10;
    this.line_dist = options.line_dist || 10000;
    this.mouse_dist = options.e_dist || 16000;
    this.mouse_position = undefined;
}

MyBg.prototype.CanvasInit = function() {
    const _this = this;
    if (this.faBox == null) {
        console.error(`获取不到名为 ${this.faBoxName} 背景盒子！`);
        return;
    }
    this.CreateCanvas();
    this.Mouses();
    setInterval(function() {
        _this.PointCreate();
    }, 40)

}
MyBg.prototype.CreateCanvas = function() {
    const _this = this;
    const canvas = document.createElement('canvas');
    canvas.width = this.faBox.offsetWidth;
    canvas.height = this.faBox.offsetHeight;
    this.Context = canvas.getContext('2d');
    this.faBox.append(canvas);
    window.onresize = function() {
        canvas.width = _this.faBox.offsetWidth;
        canvas.height = _this.faBox.offsetHeight;
    }
}
MyBg.prototype.Mouses = function() {
    const _this = this;
    this.faBox.onmousemove = function(ev) {
        _this.mouse_position = {
            x: ev.clientX,
            y: ev.clientY
        }
    }
    this.faBox.onmouseleave = function() {
        _this.mouse_position = undefined;
    }
}
MyBg.prototype.PointCreate = function() {
    const Boders = (p) => {
        if (p.x <= 0 || p.x >= this.faBox.offsetWidth) {
            p.vx = -p.vx;
            p.x += p.vx;
        } else if (p.y <= 0 || p.y >= this.faBox.offsetHeight) {
            p.vy = -p.vy;
            p.y += p.vy;
        }
        else {
            p = {
                x: p.x + p.vx,
                y: p.y + p.vy,
                vx: p.vx,
                vy: p.vy,
                conn: p.conn
            }
        }
        return p;
    }
    this.Context.clearRect(0, 0, this.faBox.offsetWidth, this.faBox.offsetHeight);
    let points = {};
    this.Context.beginPath();
    this.Context.fillStyle = `rgb(${this.ball_color})`;
    for (let i = 0; i < this.ball_count; i++) {
        if (this.ball_points.length < this.ball_count) {
            points = {
                x: Math.floor(Math.random() * this.faBox.offsetWidth),
                y: Math.floor(Math.random() * this.faBox.offsetHeight),
                vx: (0.5 - Math.random()) * 4,
                vy: (0.5 - Math.random()) * 4,
                conn: 0,
            }
        }
        else {
            points = Boders(this.ball_points[i]);
        }
        this.Context.shadowColor = `rgb(${this.line_color})`;
        this.Context.shadowBlur = 12;
        this.Context.fillRect(points.x, points.y, this.ball_w, this.ball_h);
        this.ball_points[i] = points;
    }
    this.Context.closePath();
    this.Lines();
}
MyBg.prototype.Lines = function() {
    let _this = this;
    const Dists = (i, x2, y2) => {
        const distX = this.ball_points[i].x - x2;
        const distY = this.ball_points[i].y - y2;
        return distX * distX + distY * distY;
    }
    let binding = (i, x2, y2) => {
        _this.Context.beginPath();
        _this.Context.moveTo(_this.ball_points[i].x, _this.ball_points[i].y);
        _this.Context.lineTo(x2, y2);
        _this.Context.stroke();
        _this.Context.closePath();
    }
    for (let i = 0; i < this.ball_count; i++) {
        this.ball_points[i].conn = 0;
        for (let j = 0; j < i; j++) {
            let dist = Dists(i, this.ball_points[j].x, this.ball_points[j].y);
            if (dist <= this.line_dist && this.ball_points[i].conn < this.line_conn) {
                this.ball_points[i].conn++;
                this.Context.lineWidth = 0.5 - dist / this.line_dist;
                this.Context.strokeStyle = `rgba(${this.line_color},${1 - dist / this.line_dist})`;
                binding(i, this.ball_points[j].x, this.ball_points[j].y);
            }
        }
        if (this.mouse_position) {
            let dist = Dists(i, this.mouse_position.x, this.mouse_position.y);
            if (dist < this.mouse_dist && dist > this.line_dist) {
                this.ball_points[i].x += (this.mouse_position.x - this.ball_points[i].x) / 20;
                this.ball_points[i].y += (this.mouse_position.y - this.ball_points[i].y) / 20;
            }
            if (dist < this.mouse_dist) {
                this.Context.lineWidth = 0.6;
                this.Context.strokeStyle = `rgba(${this.line_color},0.8)`;
                binding(i, this.mouse_position.x, this.mouse_position.y);
            }
        }
    }
}

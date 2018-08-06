// Generated by CoffeeScript 1.12.6
(function() {
  var Attract, AttractLine, AttractRepel, AttractRepelLine, Circle, Complex, Controller, Diagonalizable, Dynamics, HSVtoRGB, Hyperbolas, Repel, RepelLine, ScaleInOutShear, ScaleInShear, ScaleOutShear, Shear, Spiral, SpiralIn, SpiralOut, colorShader, diagShader, discLerp, easeCode, expLerp, inv22, linLerp, mult22, polyLerp, randElt, randSign, rotateShader, shearShader, sizeShader,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  easeCode = "#define M_PI 3.1415926535897932384626433832795\n\nfloat easeInOutSine(float pos) {\n    return 0.5 * (1.0 - cos(M_PI * pos));\n}";

  rotateShader = easeCode + "uniform float deltaAngle;\nuniform float scale;\nuniform float time;\n\nvec4 getPointSample(vec4 xyzw);\n\nvec4 rotate(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    if(time < start) {\n        return vec4(point.xy, 0.0, 0.0);\n    }\n    float pos = min((time - start) / duration, 1.0);\n    pos = easeInOutSine(pos);\n    float c = cos(deltaAngle * pos);\n    float s = sin(deltaAngle * pos);\n    point.xy = vec2(point.x * c - point.y * s, point.x * s + point.y * c)\n        * pow(scale, pos);\n    return vec4(point.xy, 0.0, 0.0);\n}";

  diagShader = easeCode + "uniform float scaleX;\nuniform float scaleY;\nuniform float time;\n\nvec4 getPointSample(vec4 xyzw);\n\nvec4 rotate(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    if(time < start) {\n        return vec4(point.xy, 0.0, 0.0);\n    }\n    float pos = min((time - start) / duration, 1.0);\n    pos = easeInOutSine(pos);\n    point.x *= pow(scaleX, pos);\n    point.y *= pow(scaleY, pos);\n    return vec4(point.xy, 0.0, 0.0);\n}";

  shearShader = easeCode + "uniform float scale;\nuniform float translate;\nuniform float time;\n\nvec4 getPointSample(vec4 xyzw);\n\nvec4 shear(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    if(time < start) {\n        return vec4(point.xy, 0.0, 0.0);\n    }\n    float pos = min((time - start) / duration, 1.0);\n    pos = easeInOutSine(pos);\n    float s = pow(scale, pos);\n    point.x  = s * (point.x + translate * pos * point.y);\n    point.y *= s;\n    return vec4(point.xy, 0.0, 0.0);\n}";

  colorShader = easeCode + "uniform float time;\n\nvec4 getPointSample(vec4 xyzw);\nvec4 getColorSample(vec4 xyzw);\n\nvec3 hsv2rgb(vec3 c) {\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\n#define TRANSITION 0.2\n\nvec4 getColor(vec4 xyzw) {\n    vec4 color = getColorSample(xyzw);\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    float pos, ease;\n    pos = max(0.0, min(1.0, (time - start) / duration));\n    if(pos < TRANSITION) {\n        ease = easeInOutSine(pos / TRANSITION);\n        color.w *= ease * 0.6 + 0.4;\n        color.y *= ease * 0.6 + 0.4;\n    }\n    else if(pos > 1.0 - TRANSITION) {\n        ease = easeInOutSine((1.0 - pos) / TRANSITION);\n        color.w *= ease * 0.6 + 0.4;\n        color.y *= ease * 0.6 + 0.4;\n    }\n    return vec4(hsv2rgb(color.xyz), color.w);\n}";

  sizeShader = easeCode + "uniform float time;\nuniform float small;\n\nvec4 getPointSample(vec4 xyzw);\n\n#define TRANSITION 0.2\n#define BIG (small * 7.0 / 5.0)\n\nvec4 getSize(vec4 xyzw) {\n    vec4 point = getPointSample(xyzw);\n    float start = point.z;\n    float duration = point.w;\n    float pos, ease, size = BIG;\n    pos = max(0.0, min(1.0, (time - start) / duration));\n    if(pos < TRANSITION) {\n        ease = easeInOutSine(pos / TRANSITION);\n        size = small * (1.0-ease) + BIG * ease;\n    }\n    else if(pos > 1.0 - TRANSITION) {\n        ease = easeInOutSine((1.0 - pos) / TRANSITION);\n        size = small * (1.0-ease) + BIG * ease;\n    }\n    return vec4(size, 0.0, 0.0, 0.0);\n}";

  HSVtoRGB = function(h, s, v) {
    var f, i, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };

  expLerp = function(a, b) {
    return function(t) {
      return Math.pow(b, t) * Math.pow(a, 1 - t);
    };
  };

  linLerp = function(a, b) {
    return function(t) {
      return b * t + a * (1 - t);
    };
  };

  polyLerp = function(a, b, n) {
    return function(t) {
      return Math.pow(t, n) * (b - a) + a;
    };
  };

  discLerp = function(a, b, n) {
    return function(t) {
      return Math.floor(Math.random() * (n + 1)) * (b - a) / n + a;
    };
  };

  randElt = function(l) {
    return l[Math.floor(Math.random() * l.length)];
  };

  randSign = function() {
    return randElt([-1, 1]);
  };

  mult22 = function(m, v) {
    return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
  };

  inv22 = function(m) {
    var det;
    det = m[0] * m[3] - m[1] * m[2];
    return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det];
  };

  Controller = (function() {
    function Controller(mathbox, opts) {
      this.delay = bind(this.delay, this);
      this.installCoords = bind(this.installCoords, this);
      this.randomizeCoords = bind(this.randomizeCoords, this);
      this.start = bind(this.start, this);
      this.install = bind(this.install, this);
      if (opts == null) {
        opts = {};
      }
      if (opts.numPointsRow == null) {
        opts.numPointsRow = 50;
      }
      if (opts.numPointsCol == null) {
        opts.numPointsCol = 100;
      }
      if (opts.duration == null) {
        opts.duration = 3.0;
      }
      this.mathbox = mathbox;
      this.current = null;
      this.numPointsRow = opts.numPointsRow;
      this.numPointsCol = opts.numPointsCol;
      this.numPoints = this.numPointsRow * this.numPointsCol - 1;
      this.duration = opts.duration;
      this.curTime = 0;
      this.points = [[0, 0, -1, 1e15]];
      this.colors = [[0, 0, 0, 1]].concat((function() {
        var k, ref, results;
        results = [];
        for (k = 0, ref = this.numPoints; 0 <= ref ? k < ref : k > ref; 0 <= ref ? k++ : k--) {
          results.push([Math.random(), 1, 0.7, 1]);
        }
        return results;
      }).call(this));
      this.view0 = mathbox.cartesian({
        range: [[-1, 1], [-1, 1]],
        scale: [1, 1]
      });
      this.view = null;
      this.extents = {
        x: 0,
        y: 0,
        rad: 0
      };
      this.initialized = false;
      this.shaderElt = null;
      this.linesElt = null;
      this.linesDataElt = null;
    }

    Controller.prototype.install = function(type) {
      var canvas, i, k, ref;
      this.current = new type(this.extents);
      canvas = this.mathbox._context.canvas;
      for (i = k = 1, ref = this.numPoints; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
        this.points[i] = this.current.newPoint();
        this.points[i][2] = this.curTime + this.delay(true);
        this.points[i][3] = this.duration;
      }
      if (this.initialized) {
        this.shaderElt.set(this.current.shaderParams());
        this.linesDataElt.set(this.current.linesParams());
        return this.linesElt.set("closed", this.current.refClosed());
      } else {
        this.pointsElt = this.view.matrix({
          id: "points-orig",
          channels: 4,
          width: this.numPointsRow,
          height: this.numPointsCol,
          data: this.points
        });
        this.shaderElt = this.pointsElt.shader(this.current.shaderParams(), {
          time: (function(_this) {
            return function(t) {
              return _this.curTime = t;
            };
          })(this)
        });
        this.shaderElt.resample({
          id: "points"
        });
        this.view0.matrix({
          channels: 4,
          width: this.numPointsRow,
          height: this.numPointsCol,
          data: this.colors,
          live: false
        }).shader({
          code: colorShader,
          sources: [this.pointsElt]
        }, {
          time: function(t) {
            return t;
          }
        }).resample({
          id: "colors"
        });
        this.view0.shader({
          code: sizeShader
        }, {
          time: function(t) {
            return t;
          },
          small: function() {
            return 5 / 739 * canvas.clientWidth;
          }
        }).resample({
          source: this.pointsElt,
          id: "sizes"
        });
        this.view.point({
          points: "#points",
          color: "white",
          colors: "#colors",
          size: 1,
          sizes: "#sizes",
          zBias: 1,
          zIndex: 2
        });
        this.linesDataElt = this.view.matrix(this.current.linesParams());
        this.linesElt = this.view.line({
          color: "rgb(80, 120, 255)",
          width: 2,
          opacity: 0.4,
          zBias: 0,
          zIndex: 1,
          closed: this.current.refClosed()
        });
        return this.initialized = true;
      }
    };

    Controller.prototype.start = function() {
      return setInterval((function(_this) {
        return function() {
          var end, i, k, len1, point, ref, ref1, ref2;
          ref = _this.points;
          for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
            point = ref[i];
            if (i === 0) {
              continue;
            }
            end = point[2] + point[3];
            if (end < _this.curTime) {
              ref1 = mult22(_this.current.stepMat, point), point[0] = ref1[0], point[1] = ref1[1];
              ref2 = _this.current.updatePoint(point), point[0] = ref2[0], point[1] = ref2[1];
              point[2] = _this.curTime + _this.delay();
            }
          }
          return null;
        };
      })(this), 100);
    };

    Controller.prototype.randomizeCoords = function() {
      var distribution, len, v1, v2, θ, θoff;
      v1 = [0, 0];
      v2 = [0, 0];
      distribution = linLerp(0.5, 2);
      len = distribution(Math.random());
      θ = Math.random() * 2 * π;
      v1[0] = Math.cos(θ) * len;
      v1[1] = Math.sin(θ) * len;
      θoff = randSign() * linLerp(π / 4, 3 * π / 4)(Math.random());
      len = distribution(Math.random());
      v2[0] = Math.cos(θ + θoff) * len;
      v2[1] = Math.sin(θ + θoff) * len;
      return this.installCoords([v1[0], v2[0], v1[1], v2[1]]);
    };

    Controller.prototype.installCoords = function(coordMat) {
      var coordMatInv, corners, i, k, len1, rad, ref, results, transformMat;
      coordMatInv = inv22(coordMat);
      corners = [[1, 1], [-1, 1]].map(function(c) {
        return mult22(coordMatInv, c);
      });
      rad = Math.max.apply(null, corners.map(function(c) {
        return c[0] * c[0] + c[1] * c[1];
      }));
      this.extents = {
        rad: Math.sqrt(rad),
        x: Math.max.apply(null, corners.map(function(c) {
          return Math.abs(c[0]);
        })),
        y: Math.max.apply(null, corners.map(function(c) {
          return Math.abs(c[1]);
        }))
      };
      transformMat = [coordMat[0], coordMat[1], 0, 0, coordMat[2], coordMat[3], 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      if (this.view) {
        return this.view.set('matrix', transformMat);
      } else {
        this.view = this.view0.transform({
          matrix: transformMat
        });
        ref = [1, 2];
        results = [];
        for (k = 0, len1 = ref.length; k < len1; k++) {
          i = ref[k];
          results.push(this.view.axis({
            axis: i,
            end: false,
            width: 3,
            size: 5,
            zBias: -1,
            depth: 1,
            color: "black",
            opacity: 0.3,
            range: [-10, 10]
          }));
        }
        return results;
      }
    };

    Controller.prototype.delay = function(first) {
      var pos, scale;
      scale = this.numPoints / 1000;
      pos = Math.random() * scale;
      if (first) {
        return pos - 0.5 * scale;
      } else {
        return pos;
      }
    };

    return Controller;

  })();

  Dynamics = (function() {
    function Dynamics(extents1) {
      this.extents = extents1;
      this.refClosed = bind(this.refClosed, this);
      this.linesParams = bind(this.linesParams, this);
    }

    Dynamics.prototype.linesParams = function() {
      this.reference = this.makeReference();
      return {
        channels: 2,
        height: this.reference.length,
        width: this.reference[0].length,
        items: this.reference[0][0].length,
        data: this.reference,
        live: false
      };
    };

    Dynamics.prototype.refClosed = function() {
      return false;
    };

    return Dynamics;

  })();

  Complex = (function(superClass) {
    extend(Complex, superClass);

    function Complex(extents) {
      this.shaderParams = bind(this.shaderParams, this);
      this.newPoint = bind(this.newPoint, this);
      Complex.__super__.constructor.call(this, extents);
      this.deltaAngle = randSign() * linLerp(π / 6, 5 * π / 6)(Math.random());
      this.scale = this.getScale();
      this.stepMat = [Math.cos(this.deltaAngle) * this.scale, -Math.sin(this.deltaAngle) * this.scale, Math.sin(this.deltaAngle) * this.scale, Math.cos(this.deltaAngle) * this.scale];
      this.makeDistributions();
    }

    Complex.prototype.newPoint = function(oldPoint) {
      var distribution, r, θ;
      distribution = !oldPoint ? this.origDist : this.newDist;
      r = distribution(Math.random());
      θ = Math.random() * 2 * π;
      return [Math.cos(θ) * r, Math.sin(θ) * r, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    Complex.prototype.shaderParams = function() {
      return {
        code: rotateShader,
        uniforms: {
          deltaAngle: {
            type: 'f',
            value: this.deltaAngle
          },
          scale: {
            type: 'f',
            value: this.scale
          }
        }
      };
    };

    return Complex;

  })(Dynamics);

  Circle = (function(superClass) {
    extend(Circle, superClass);

    function Circle() {
      this.refClosed = bind(this.refClosed, this);
      this.makeReference = bind(this.makeReference, this);
      this.makeDistributions = bind(this.makeDistributions, this);
      this.getScale = bind(this.getScale, this);
      return Circle.__super__.constructor.apply(this, arguments);
    }

    Circle.prototype.getScale = function() {
      return 1;
    };

    Circle.prototype.makeDistributions = function() {
      return this.newDist = this.origDist = polyLerp(0.01, this.extents.rad, 1 / 2);
    };

    Circle.prototype.makeReference = function() {
      var k, o, ref, ref1, ref2, ref3, ref4, ret, row, s, t;
      ret = [];
      for (t = k = 0, ref = 2 * π, ref1 = π / 72; ref1 > 0 ? k < ref : k > ref; t = k += ref1) {
        row = [];
        for (s = o = ref2 = this.extents.rad / 10, ref3 = this.extents.rad, ref4 = this.extents.rad / 10; ref4 > 0 ? o < ref3 : o > ref3; s = o += ref4) {
          row.push([s * Math.cos(t), s * Math.sin(t)]);
        }
        ret.push(row);
      }
      return [ret];
    };

    Circle.prototype.updatePoint = function(point) {
      return point;
    };

    Circle.prototype.refClosed = function() {
      return true;
    };

    return Circle;

  })(Complex);

  Spiral = (function(superClass) {
    extend(Spiral, superClass);

    function Spiral() {
      this.makeReference = bind(this.makeReference, this);
      return Spiral.__super__.constructor.apply(this, arguments);
    }

    Spiral.prototype.makeReference = function() {
      var close, d, i, items, iters, j, k, o, ref, ref1, ref2, ret, rotations, row, s, ss, t, u, w;
      ret = [];
      close = 0.05;
      s = this.scale > 1 ? this.scale : 1 / this.scale;
      iters = (Math.log(this.extents.rad) - Math.log(close)) / Math.log(s);
      rotations = Math.ceil(this.deltaAngle * iters / 2 * π);
      d = this.direction;
      for (i = k = 0, ref = rotations; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        row = [];
        for (t = o = 0; o <= 100; t = ++o) {
          u = (i + t / 100) * 2 * π;
          ss = close * Math.pow(s, u / this.deltaAngle);
          items = [];
          for (j = w = 0, ref1 = 2 * π, ref2 = π / 4; ref2 > 0 ? w < ref1 : w > ref1; j = w += ref2) {
            items.push([ss * Math.cos(d * (u + j)), ss * Math.sin(d * (u + j))]);
          }
          row.push(items);
        }
        ret.push(row);
      }
      return ret;
    };

    return Spiral;

  })(Complex);

  SpiralIn = (function(superClass) {
    extend(SpiralIn, superClass);

    function SpiralIn(extents) {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeDistributions = bind(this.makeDistributions, this);
      SpiralIn.__super__.constructor.call(this, extents);
      this.direction = -1;
    }

    SpiralIn.prototype.getScale = function() {
      return linLerp(0.3, 0.8)(Math.random());
    };

    SpiralIn.prototype.makeDistributions = function() {
      var distance, distances;
      this.close = 0.01;
      this.medium = this.extents.rad;
      this.far = this.extents.rad / this.scale;
      switch (randElt(['cont', 'disc'])) {
        case 'cont':
          this.origDist = expLerp(this.close, this.far);
          return this.newDist = expLerp(this.medium, this.far);
        case 'disc':
          distances = [];
          distance = this.far;
          while (distance > this.close) {
            distances.push(distance);
            distance *= this.scale;
          }
          this.origDist = function(t) {
            return distances[Math.floor(t * distances.length)];
          };
          return this.newDist = (function(_this) {
            return function(t) {
              return _this.far;
            };
          })(this);
      }
    };

    SpiralIn.prototype.updatePoint = function(point) {
      if (point[0] * point[0] + point[1] * point[1] < this.close * this.close) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return SpiralIn;

  })(Spiral);

  SpiralOut = (function(superClass) {
    extend(SpiralOut, superClass);

    function SpiralOut(extents) {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeDistributions = bind(this.makeDistributions, this);
      this.getScale = bind(this.getScale, this);
      SpiralOut.__super__.constructor.call(this, extents);
      this.direction = 1;
    }

    SpiralOut.prototype.getScale = function() {
      return linLerp(1 / 0.8, 1 / 0.3)(Math.random());
    };

    SpiralOut.prototype.makeDistributions = function() {
      var distance, distances;
      this.veryClose = 0.01 / this.scale;
      this.close = 0.01;
      this.medium = this.extents.rad;
      switch (randElt(['cont', 'disc'])) {
        case 'cont':
          this.origDist = expLerp(this.veryClose, this.medium);
          return this.newDist = expLerp(this.veryClose, this.close);
        case 'disc':
          distances = [];
          distance = this.veryClose;
          while (distance < this.medium) {
            distances.push(distance);
            distance *= this.scale;
          }
          this.origDist = function(t) {
            return distances[Math.floor(t * distances.length)];
          };
          return this.newDist = (function(_this) {
            return function(t) {
              return _this.veryClose;
            };
          })(this);
      }
    };

    SpiralOut.prototype.updatePoint = function(point) {
      if (point[0] * point[0] + point[1] * point[1] > this.medium * this.medium) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return SpiralOut;

  })(Spiral);

  Diagonalizable = (function(superClass) {
    extend(Diagonalizable, superClass);

    function Diagonalizable(extents) {
      this.shaderParams = bind(this.shaderParams, this);
      Diagonalizable.__super__.constructor.call(this, extents);
      this.makeScales();
      this.stepMat = [this.scaleX, 0, 0, this.scaleY];
    }

    Diagonalizable.prototype.shaderParams = function() {
      return {
        code: diagShader,
        uniforms: {
          scaleX: {
            type: 'f',
            value: this.scaleX
          },
          scaleY: {
            type: 'f',
            value: this.scaleY
          }
        }
      };
    };

    return Diagonalizable;

  })(Dynamics);

  Hyperbolas = (function(superClass) {
    extend(Hyperbolas, superClass);

    function Hyperbolas() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeReference = bind(this.makeReference, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return Hyperbolas.__super__.constructor.apply(this, arguments);
    }

    Hyperbolas.prototype.makeScales = function() {
      this.scaleX = linLerp(0.3, 0.8)(Math.random());
      this.scaleY = linLerp(1 / 0.8, 1 / 0.3)(Math.random());
      this.logScaleX = Math.log(this.scaleX);
      this.logScaleY = Math.log(this.scaleY);
      this.close = 0.05;
      this.closeR = Math.pow(this.close, this.logScaleY - this.logScaleX);
      this.farR = Math.pow(this.extents.x, this.logScaleY) * Math.pow(this.extents.y, -this.logScaleX);
      return this.lerpR = linLerp(this.closeR, this.farR);
    };

    Hyperbolas.prototype.newPoint = function(oldPoint) {
      var closeX, r, x, y;
      r = this.lerpR(Math.random());
      if (!oldPoint) {
        closeX = Math.pow(r * Math.pow(this.extents.y, this.logScaleX), 1 / this.logScaleY);
        x = expLerp(closeX, this.extents.x / this.scaleX)(Math.random());
      } else {
        x = expLerp(this.extents.x, this.extents.x / this.scaleX)(Math.random());
      }
      y = Math.pow(1 / r * Math.pow(x, this.logScaleY), 1 / this.logScaleX);
      return [randSign() * x, randSign() * y, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    Hyperbolas.prototype.makeReference = function() {
      var closeX, i, k, lerp, o, r, ret, row, t, x, y;
      ret = [];
      for (t = k = 0; k < 20; t = ++k) {
        r = this.lerpR(t / 20);
        closeX = Math.pow(r * Math.pow(this.extents.y, this.logScaleX), 1 / this.logScaleY);
        lerp = expLerp(closeX, this.extents.x);
        row = [];
        for (i = o = 0; o <= 100; i = ++o) {
          x = lerp(i / 100);
          y = Math.pow(1 / r * Math.pow(x, this.logScaleY), 1 / this.logScaleX);
          row.push([[x, y], [-x, y], [x, -y], [-x, -y]]);
        }
        ret.push(row);
      }
      return ret;
    };

    Hyperbolas.prototype.updatePoint = function(point) {
      if (Math.abs(point[1]) > this.extents.y) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return Hyperbolas;

  })(Diagonalizable);

  AttractRepel = (function(superClass) {
    extend(AttractRepel, superClass);

    function AttractRepel() {
      this.makeReference = bind(this.makeReference, this);
      this.makeScales = bind(this.makeScales, this);
      return AttractRepel.__super__.constructor.apply(this, arguments);
    }

    AttractRepel.prototype.makeScales = function() {
      var a, offset;
      this.logScaleX = Math.log(this.scaleX);
      this.logScaleY = Math.log(this.scaleY);
      offset = 0.05;
      this.lerpR = function(t) {
        t = linLerp(offset, 1 - offset)(t);
        return Math.pow(t, this.logScaleY) * Math.pow(1 - t, -this.logScaleX);
      };
      a = this.logScaleY / this.logScaleX;
      this.sMin = 0.01;
      this.sMax = Math.pow(this.extents.x, a) + this.extents.y;
      this.yValAt = function(r, s) {
        return s / (1 + Math.pow(r, 1 / this.logScaleX));
      };
      return this.xOfY = function(y, r) {
        return Math.pow(r * Math.pow(y, this.logScaleX), 1 / this.logScaleY);
      };
    };

    AttractRepel.prototype.makeReference = function() {
      var i, k, lerp, o, r, ret, row, x, y;
      ret = [];
      for (i = k = 0; k < 15; i = ++k) {
        r = this.lerpR(i / 15);
        lerp = expLerp(0.01, this.extents.y);
        row = [];
        for (i = o = 0; o <= 100; i = ++o) {
          y = lerp(i / 100);
          x = this.xOfY(y, r);
          row.push([[x, y], [-x, y], [x, -y], [-x, -y]]);
        }
        ret.push(row);
      }
      return ret;
    };

    return AttractRepel;

  })(Diagonalizable);

  Attract = (function(superClass) {
    extend(Attract, superClass);

    function Attract() {
      this.updatePoint = bind(this.updatePoint, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return Attract.__super__.constructor.apply(this, arguments);
    }

    Attract.prototype.makeScales = function() {
      this.scaleX = linLerp(0.3, 0.9)(Math.random());
      this.scaleY = linLerp(0.3, this.scaleX)(Math.random());
      return Attract.__super__.makeScales.apply(this, arguments);
    };

    Attract.prototype.newPoint = function(oldPoint) {
      var closeY, farY, r, x, y;
      r = this.lerpR(Math.random());
      farY = this.yValAt(r, this.sMax / this.scaleY);
      if (!oldPoint) {
        closeY = this.yValAt(r, this.sMin);
      } else {
        closeY = this.yValAt(r, this.sMax);
      }
      y = expLerp(closeY, farY)(Math.random());
      x = this.xOfY(y, r);
      return [randSign() * x, randSign() * y, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    Attract.prototype.updatePoint = function(point) {
      if (Math.abs(point[1]) < .01) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return Attract;

  })(AttractRepel);

  Repel = (function(superClass) {
    extend(Repel, superClass);

    function Repel() {
      this.updatePoint = bind(this.updatePoint, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return Repel.__super__.constructor.apply(this, arguments);
    }

    Repel.prototype.makeScales = function() {
      this.scaleY = linLerp(1 / 0.9, 1 / 0.3)(Math.random());
      this.scaleX = linLerp(1 / 0.9, this.scaleY)(Math.random());
      return Repel.__super__.makeScales.apply(this, arguments);
    };

    Repel.prototype.newPoint = function(oldPoint) {
      var closeY, farY, r, x, y;
      r = this.lerpR(Math.random());
      closeY = this.yValAt(r, this.sMin / this.scaleY);
      if (!oldPoint) {
        farY = this.yValAt(r, this.sMax);
      } else {
        farY = this.yValAt(r, this.sMin);
      }
      y = expLerp(closeY, farY)(Math.random());
      x = this.xOfY(y, r);
      return [randSign() * x, randSign() * y, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    Repel.prototype.updatePoint = function(point) {
      if (Math.abs(point[0]) > this.extents.x || Math.abs(point[1]) > this.extents.y) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return Repel;

  })(AttractRepel);

  AttractRepelLine = (function(superClass) {
    extend(AttractRepelLine, superClass);

    function AttractRepelLine() {
      this.makeReference = bind(this.makeReference, this);
      this.newPoint = bind(this.newPoint, this);
      this.makeScales = bind(this.makeScales, this);
      return AttractRepelLine.__super__.constructor.apply(this, arguments);
    }

    AttractRepelLine.prototype.makeScales = function() {
      this.scaleX = 1;
      return this.lerpX = linLerp(-this.extents.x, this.extents.x);
    };

    AttractRepelLine.prototype.newPoint = function(oldPoint) {
      var x, y;
      x = this.lerpX(Math.random());
      y = (!oldPoint ? this.origLerpY : this.newLerpY)(Math.random());
      return [x, randSign() * y, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    AttractRepelLine.prototype.makeReference = function() {
      var i, item1, item2, k, x;
      item1 = [];
      item2 = [];
      for (i = k = 0; k < 20; i = ++k) {
        x = this.lerpX((i + .5) / 20);
        item1.push([x, -this.extents.y]);
        item2.push([x, this.extents.y]);
      }
      return [[item1, item2]];
    };

    return AttractRepelLine;

  })(Diagonalizable);

  AttractLine = (function(superClass) {
    extend(AttractLine, superClass);

    function AttractLine() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeScales = bind(this.makeScales, this);
      return AttractLine.__super__.constructor.apply(this, arguments);
    }

    AttractLine.prototype.makeScales = function() {
      AttractLine.__super__.makeScales.apply(this, arguments);
      this.scaleY = linLerp(0.3, 0.8)(Math.random());
      this.origLerpY = expLerp(0.01, this.extents.y / this.scaleY);
      return this.newLerpY = expLerp(this.extents.y, this.extents.y / this.scaleY);
    };

    AttractLine.prototype.updatePoint = function(point) {
      if (Math.abs(point[1]) < 0.01) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return AttractLine;

  })(AttractRepelLine);

  RepelLine = (function(superClass) {
    extend(RepelLine, superClass);

    function RepelLine() {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeScales = bind(this.makeScales, this);
      return RepelLine.__super__.constructor.apply(this, arguments);
    }

    RepelLine.prototype.makeScales = function() {
      RepelLine.__super__.makeScales.apply(this, arguments);
      this.scaleY = linLerp(1 / 0.8, 1 / 0.3)(Math.random());
      this.origLerpY = expLerp(0.01 / this.scaleY, this.extents.y);
      return this.newLerpY = expLerp(0.01 / this.scaleY, 0.01);
    };

    RepelLine.prototype.updatePoint = function(point) {
      if (Math.abs(point[1]) > this.extents.y) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return RepelLine;

  })(AttractRepelLine);

  Shear = (function(superClass) {
    extend(Shear, superClass);

    function Shear(extents) {
      this.updatePoint = bind(this.updatePoint, this);
      this.makeReference = bind(this.makeReference, this);
      this.shaderParams = bind(this.shaderParams, this);
      this.newPoint = bind(this.newPoint, this);
      Shear.__super__.constructor.call(this, extents);
      this.translate = randSign() * linLerp(0.2, 2.0)(Math.random());
      this.stepMat = [1, this.translate, 0, 1];
      this.lerpY = linLerp(0.01, this.extents.y);
      this.lerpY2 = linLerp(-this.extents.y, this.extents.y);
    }

    Shear.prototype.newPoint = function(oldPoint) {
      var a, s, x, y;
      a = this.translate;
      if (!oldPoint) {
        y = this.lerpY(Math.random());
        if (Math.random() < 0.005) {
          y = 0;
          x = linLerp(-this.extents.x, this.extents.x)(Math.random());
        } else {
          if (a < 0) {
            x = linLerp(-this.extents.x, this.extents.x - a * y)(Math.random());
          } else {
            x = linLerp(-this.extents.x - a * y, this.extents.x)(Math.random());
          }
        }
      } else {
        y = Math.abs(oldPoint[1]);
        if (a < 0) {
          x = linLerp(this.extents.x, this.extents.x - a * y)(Math.random());
        } else {
          x = linLerp(-this.extents.x - a * y, -this.extents.x)(Math.random());
        }
      }
      s = randSign();
      return [s * x, s * y, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    Shear.prototype.shaderParams = function() {
      return {
        code: shearShader,
        uniforms: {
          scale: {
            type: 'f',
            value: 1.0
          },
          translate: {
            type: 'f',
            value: this.translate
          }
        }
      };
    };

    Shear.prototype.makeReference = function() {
      var i, item1, item2, k, y;
      item1 = [];
      item2 = [];
      for (i = k = 0; k < 20; i = ++k) {
        y = this.lerpY2((i + .5) / 20);
        item1.push([-this.extents.x, y]);
        item2.push([this.extents.x, y]);
      }
      return [[item1, item2]];
    };

    Shear.prototype.updatePoint = function(point) {
      if (Math.abs(point[0]) > this.extents.x) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return Shear;

  })(Dynamics);

  ScaleInOutShear = (function(superClass) {
    extend(ScaleInOutShear, superClass);

    function ScaleInOutShear(extents) {
      this.makeReference = bind(this.makeReference, this);
      this.shaderParams = bind(this.shaderParams, this);
      this.newPoint = bind(this.newPoint, this);
      var a, λ;
      ScaleInOutShear.__super__.constructor.call(this, extents);
      this.translate = randSign() * linLerp(0.2, 2.0)(Math.random());
      λ = this.scale;
      a = this.translate;
      this.stepMat = [λ, λ * a, 0, λ];
      this.xOfY = function(r, y) {
        return y * (r + a * Math.log(y) / Math.log(λ));
      };
      this.lerpR = function(t) {
        return Math.tan((t - 0.5) * π);
      };
      this.lerpR2 = function(t) {
        return Math.tan((t / 0.99 + 0.005 - 0.5) * π);
      };
    }

    ScaleInOutShear.prototype.newPoint = function(oldPoint) {
      var r, s, x, y;
      r = this.lerpR2(Math.random());
      y = (!oldPoint ? this.lerpY : this.lerpYNew)(Math.random());
      x = this.xOfY(r, y);
      s = randSign();
      return [s * x, s * y, 0, oldPoint != null ? oldPoint[3] : void 0];
    };

    ScaleInOutShear.prototype.shaderParams = function() {
      return {
        code: shearShader,
        uniforms: {
          scale: {
            type: 'f',
            value: this.scale
          },
          translate: {
            type: 'f',
            value: this.translate
          }
        }
      };
    };

    ScaleInOutShear.prototype.makeReference = function() {
      var i, j, k, numLines, o, r, ref, ret, row, x, y;
      ret = [];
      numLines = 40;
      for (i = k = 1, ref = numLines; 1 <= ref ? k < ref : k > ref; i = 1 <= ref ? ++k : --k) {
        r = this.lerpR(i / numLines);
        row = [];
        for (j = o = 0; o < 100; j = ++o) {
          y = this.lerpY(j / 100);
          x = this.xOfY(r, y);
          row.push([[x, y], [-x, -y]]);
        }
        ret.push(row);
      }
      return ret;
    };

    return ScaleInOutShear;

  })(Dynamics);

  ScaleOutShear = (function(superClass) {
    extend(ScaleOutShear, superClass);

    function ScaleOutShear(extents1) {
      this.extents = extents1;
      this.updatePoint = bind(this.updatePoint, this);
      this.scale = linLerp(1 / 0.7, 1 / 0.3)(Math.random());
      this.lerpY = expLerp(0.01 / this.scale, this.extents.y);
      this.lerpYNew = expLerp(0.01 / this.scale, 0.01);
      ScaleOutShear.__super__.constructor.call(this, this.extents);
    }

    ScaleOutShear.prototype.updatePoint = function(point) {
      if (Math.abs(point[1]) > this.extents.y) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return ScaleOutShear;

  })(ScaleInOutShear);

  ScaleInShear = (function(superClass) {
    extend(ScaleInShear, superClass);

    function ScaleInShear(extents1) {
      this.extents = extents1;
      this.updatePoint = bind(this.updatePoint, this);
      this.scale = linLerp(0.3, 0.7)(Math.random());
      this.lerpY = expLerp(0.01, this.extents.y / this.scale);
      this.lerpYNew = expLerp(this.extents.y, this.extents.y / this.scale);
      ScaleInShear.__super__.constructor.call(this, this.extents);
    }

    ScaleInShear.prototype.updatePoint = function(point) {
      if (Math.abs(point[1]) < .01) {
        return this.newPoint(point);
      } else {
        return point;
      }
    };

    return ScaleInShear;

  })(ScaleInOutShear);

  window.dynamics = {};

  window.dynamics.Controller = Controller;

  window.dynamics.Circle = Circle;

  window.dynamics.SpiralIn = SpiralIn;

  window.dynamics.SpiralOut = SpiralOut;

  window.dynamics.Hyperbolas = Hyperbolas;

  window.dynamics.Attract = Attract;

  window.dynamics.Repel = Repel;

  window.dynamics.AttractLine = AttractLine;

  window.dynamics.RepelLine = RepelLine;

  window.dynamics.Shear = Shear;

  window.dynamics.ScaleOutShear = ScaleOutShear;

  window.dynamics.ScaleInShear = ScaleInShear;

}).call(this);
;
(function(){
	window.Bezier = function(p1, p2, p3, p4) {
		// defining the bezier functions in the polynomial form
		var Cx = 3 * p1;
		var Bx = 3 * (p3 - p1) - Cx;
		var Ax = 1 - Cx - Bx;

		var Cy = 3 * p2;
		var By = 3 * (p4 - p2) - Cy;
		var Ay = 1 - Cy - By;

		function bezier_x(t) {
			return t * (Cx + t * (Bx + t * Ax));
		}

		function bezier_y(t) {
			return t * (Cy + t * (By + t * Ay));
		}

		// using Newton's method to aproximate the parametric value of x for t
		function bezier_x_der(t) {
			return Cx + t * (2 * Bx + 3 * Ax * t);
		}

		function find_x_for(t) {
			var x = t, i = 0, z;

			while (i < 5) { // making 5 iterations max
				z = bezier_x(x) - t;

				if (Math.abs(z) < 1e-3) break; // if already got close enough

				x = x - z / bezier_x_der(x);
				i++;
			}

			return x;
		}

		return function(t) {
			return bezier_y(find_x_for(t));
		}
	}
}());
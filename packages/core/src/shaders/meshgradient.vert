uniform vec2 u_cp_pos[0];

attribute float a_cp_start;
attribute vec2 a_t;
attribute vec3 a_color;

varying vec3 v_color;

const int ROWLEN = 0;
const mat4 IDENMAT = mat4(1.0);

void main() {
  int cp_start = int(a_cp_start);

  vec4 bern_x = vec4(1.0, a_t.x, pow(a_t.x, 2.0), pow(a_t.x, 3.0)) * IDENMAT;
  vec4 bern_y = vec4(1.0, a_t.y, pow(a_t.y, 2.0), pow(a_t.y, 3.0)) * IDENMAT;

  vec4 inter_p_x = vec4(
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start].x,
        u_cp_pos[cp_start + 1].x,
        u_cp_pos[cp_start + 2].x,
        u_cp_pos[cp_start + 3].x
      )
    ),
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start + ROWLEN].x,
        u_cp_pos[cp_start + ROWLEN + 1].x,
        u_cp_pos[cp_start + ROWLEN + 2].x,
        u_cp_pos[cp_start + ROWLEN + 3].x
      )
    ),
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start + ROWLEN * 2].x,
        u_cp_pos[cp_start + ROWLEN * 2 + 1].x,
        u_cp_pos[cp_start + ROWLEN * 2 + 2].x,
        u_cp_pos[cp_start + ROWLEN * 2 + 3].x
      )
    ),
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start + ROWLEN * 3].x,
        u_cp_pos[cp_start + ROWLEN * 3 + 1].x,
        u_cp_pos[cp_start + ROWLEN * 3 + 2].x,
        u_cp_pos[cp_start + ROWLEN * 3 + 3].x
      )
    )
  );

  vec4 inter_p_y = vec4(
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start].y,
        u_cp_pos[cp_start + 1].y,
        u_cp_pos[cp_start + 2].y,
        u_cp_pos[cp_start + 3].y
      )
    ),
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start + ROWLEN].y,
        u_cp_pos[cp_start + ROWLEN + 1].y,
        u_cp_pos[cp_start + ROWLEN + 2].y,
        u_cp_pos[cp_start + ROWLEN + 3].y
      )
    ),
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start + ROWLEN * 2].y,
        u_cp_pos[cp_start + ROWLEN * 2 + 1].y,
        u_cp_pos[cp_start + ROWLEN * 2 + 2].y,
        u_cp_pos[cp_start + ROWLEN * 2 + 3].y
      )
    ),
    dot(
      bern_x,
      vec4(
        u_cp_pos[cp_start + ROWLEN * 3].y,
        u_cp_pos[cp_start + ROWLEN * 3 + 1].y,
        u_cp_pos[cp_start + ROWLEN * 3 + 2].y,
        u_cp_pos[cp_start + ROWLEN * 3 + 3].y
      )
    )
  );

  gl_Position = vec4(dot(bern_y, inter_p_x), dot(bern_y, inter_p_y), 0.0, 1.0);
  v_color = a_color;
}

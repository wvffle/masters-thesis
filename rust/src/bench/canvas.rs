use std::cell::RefCell;
use std::convert::Infallible;
use std::rc::Rc;

use embedded_graphics::{
    pixelcolor::Rgb888,
    prelude::*,
    primitives::{Circle, PrimitiveStyle},
};
use wasm_bindgen::{prelude::*, Clamped};
use web_sys::{HtmlCanvasElement, ImageData};

use crate::utils::*;

const DT: f64 = 0.1;
const G: f64 = 6.67430e-11;

struct CanvasDisplay {
    height: u32,
    width: u32,
    frame_buffer: Vec<u8>,
}

impl CanvasDisplay {
    fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            frame_buffer: vec![255; (width * height * 4) as usize],
        }
    }
}

impl OriginDimensions for CanvasDisplay {
    fn size(&self) -> Size {
        Size::new(self.width, self.height)
    }
}

impl DrawTarget for CanvasDisplay {
    type Color = Rgb888;
    type Error = Infallible;

    fn draw_iter<I>(&mut self, pixels: I) -> Result<(), Self::Error>
    where
        I: IntoIterator<Item = Pixel<Self::Color>>,
    {
        let width = self.width as i32;
        let height = self.height as i32;

        for Pixel(coord, color) in pixels {
            if coord.x >= 0 && coord.x < width && coord.y >= 0 && coord.y < height {
                let index = 4 * (coord.y * width + coord.x) as usize;
                self.frame_buffer[index] = color.r();
                self.frame_buffer[index + 1] = color.g();
                self.frame_buffer[index + 2] = color.b();
            }
        }

        Ok(())
    }
}

struct Body {
    x: f64,
    y: f64,
    vx: f64,
    vy: f64,
    mass: f64,
}

static WHITE_FILL: PrimitiveStyle<Rgb888> = PrimitiveStyle::with_fill(Rgb888::WHITE);
impl Body {
    pub fn new(x: f64, y: f64, vx: f64, vy: f64, mass: f64) -> Self {
        Self { x, y, vx, vy, mass }
    }

    pub fn update(&mut self, ax: f64, ay: f64) {
        self.vx += ax * DT;
        self.vy += ay * DT;
        self.x += self.vx * DT;
        self.y += self.vy * DT;
    }

    pub fn collides_with(&self, other: &Body) -> bool {
        let dx = other.x - self.x;
        let dy = other.y - self.y;
        let d2 = dx * dx + dy * dy;
        d2 < (self.radius() + other.radius()).powi(2)
    }

    fn radius(&self) -> f64 {
        (self.mass.log(10.0) - 5.0) * 3.0
    }

    pub fn draw(&self, display: &mut CanvasDisplay) -> Result<(), JsValue> {
        Circle::new(
            Point::new(self.x as i32, self.y as i32),
            self.radius() as u32,
        )
        .into_styled(WHITE_FILL)
        .draw(display)
        .unwrap();
        Ok(())
    }
}

#[wasm_bindgen]
pub fn n_body(n: usize) -> Result<(), JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let document = window.document().ok_or("Could not get document")?;

    let canvas = document
        .get_element_by_id("canvas")
        .ok_or("Could not find #canvas")?;

    let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>()?;
    let context = canvas
        .get_context("2d")?
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()?;

    let width = canvas.width() as f64;
    let height = canvas.height() as f64;

    let mut display = CanvasDisplay::new(width as u32, height as u32);

    let mut bodies: Vec<_> = (0..n)
        .map(|_| {
            let mass = random_f64(100000.0, 10000000.0);
            let x = random_f64(0.0, width);
            let y = random_f64(0.0, height);
            let vx = random_f64(-1.0, 1.0);
            let vy = random_f64(-1.0, 1.0);
            Body::new(x, y, vx, vy, mass)
        })
        .collect();

    let f = Rc::new(RefCell::new(None));
    let g = f.clone();

    *g.borrow_mut() = Some(Closure::new({
        move || {
            display.clear(Rgb888::BLACK).unwrap();

            // Calculate acceleration
            for i in 0..bodies.len() {
                let mut ax = 0.0;
                let mut ay = 0.0;

                for j in 0..bodies.len() {
                    if i == j {
                        continue;
                    }

                    let dx = bodies[j].x - bodies[i].x;
                    let dy = bodies[j].y - bodies[i].y;
                    let d2 = dx * dx + dy * dy;
                    let d = d2.sqrt();
                    let f = G * bodies[j].mass / d2;
                    ax += f * dx / d;
                    ay += f * dy / d;
                }

                bodies[i].update(ax, ay);
            }

            // Check for boundaries
            for body in bodies.iter_mut() {
                let radius = body.radius();

                if body.x - radius < 0.0 || body.x + radius > width {
                    body.vx = -body.vx;
                }

                if body.y - radius < 0.0 || body.y + radius > height {
                    body.vy = -body.vy;
                }
            }

            // Check for collisions
            // for i in 0..bodies.len() {
            //     for j in 0..bodies.len() {
            //         if i == j {
            //             continue;
            //         }

            //         if bodies[i].collides_with(&bodies[j]) {
            //             let (vx1, vy1) = (bodies[i].vx, bodies[i].vy);
            //             let (vx2, vy2) = (bodies[j].vx, bodies[j].vy);

            //             bodies[i].vx = vx2;
            //             bodies[i].vy = vy2;
            //             bodies[j].vx = vx1;
            //             bodies[j].vy = vy1;
            //         }
            //     }
            // }

            for body in bodies.iter() {
                body.draw(&mut display).unwrap();
            }

            context
                .put_image_data(
                    &ImageData::new_with_u8_clamped_array_and_sh(
                        Clamped(&display.frame_buffer),
                        display.width,
                        display.height,
                    )
                    .unwrap(),
                    0.0,
                    0.0,
                )
                .unwrap();

            request_animation_frame(f.borrow().as_ref().unwrap());
        }
    }));

    request_animation_frame(g.borrow().as_ref().unwrap());

    Ok(())
}

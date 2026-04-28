#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, LogicalSize, Manager, Size, Window, WindowBuilder, WindowEvent, WindowUrl};

const WINDOW_WIDTH: f64 = 336.0;
const WINDOW_HEIGHT: f64 = 296.0;
const BASE_OFFSET: f64 = 28.0;

fn fixed_window_size() -> Size {
    Size::Logical(LogicalSize::new(WINDOW_WIDTH, WINDOW_HEIGHT))
}

fn apply_fixed_window_size(window: &Window) {
    let size = fixed_window_size();
    let _ = window.set_min_size(Some(size));
    let _ = window.set_max_size(Some(size));
    let _ = window.set_size(size);
}

fn attach_window_guards(window: &Window) {
    apply_fixed_window_size(window);

    let guarded_window = window.clone();
    window.clone().on_window_event(move |event| {
        if let WindowEvent::ScaleFactorChanged { .. } = event {
            apply_fixed_window_size(&guarded_window);
        }
    });
}

#[tauri::command]
fn create_widget(app: AppHandle, window: Window) -> Result<String, String> {
    let next_index = app.windows().len() + 1;
    let label = format!("widget-{next_index}");

    if app.get_window(&label).is_some() {
        return Err("widget label already exists".into());
    }

    let (mut x, mut y) = (40.0 + BASE_OFFSET * next_index as f64, 40.0 + BASE_OFFSET * next_index as f64);

    if let Ok(position) = window.outer_position() {
        x = position.x as f64 + BASE_OFFSET;
        y = position.y as f64 + BASE_OFFSET;
    }

    let window = WindowBuilder::new(&app, label.clone(), WindowUrl::App("index.html".into()))
        .title("Clock Widget")
        .inner_size(WINDOW_WIDTH, WINDOW_HEIGHT)
        .resizable(false)
        .fullscreen(false)
        .decorations(false)
        .transparent(true)
        .always_on_top(false)
        .skip_taskbar(true)
        .focused(true)
        .position(x, y)
        .build()
        .map_err(|error| error.to_string())?;

    attach_window_guards(&window);

    Ok(label)
}

#[tauri::command]
fn close_widget(window: Window) -> Result<(), String> {
    window.close().map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            for window in app.windows().values() {
                attach_window_guards(window);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![create_widget, close_widget])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn window_size_constants_are_positive() {
        assert!(WINDOW_WIDTH > 0.0);
        assert!(WINDOW_HEIGHT > 0.0);
    }

    #[test]
    fn fixed_window_size_matches_constants() {
        let size = fixed_window_size();
        if let Size::Logical(logical) = size {
            assert_eq!(logical.width, WINDOW_WIDTH);
            assert_eq!(logical.height, WINDOW_HEIGHT);
        } else {
            panic!("expected logical size");
        }
    }

    #[test]
    fn base_offset_is_positive() {
        assert!(BASE_OFFSET > 0.0);
    }

    #[test]
    fn fallback_position_cascades_by_index() {
        let index = 3usize;
        let x = 40.0 + BASE_OFFSET * index as f64;
        let y = 40.0 + BASE_OFFSET * index as f64;
        assert_eq!(x, 40.0 + BASE_OFFSET * 3.0);
        assert_eq!(y, x);
    }
}

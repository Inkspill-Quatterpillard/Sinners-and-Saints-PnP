from nicegui import ui

dark = ui.dark_mode()
dark.enable()
ui.colors(primary='#555')

with ui.header().classes(replace='row items-center') as header:
    ui.button(on_click=lambda: left_drawer.toggle(), icon='menu').props('flat color=white')

with ui.footer(value=False) as footer:
    ui.label('Footer')

with ui.left_drawer().classes('bg-blue-100') as left_drawer:
    ui.label('Side menu')

with ui.row().classes('h-full w-full no-wrap') as basic_row:
    with ui.column(wrap=False, align_items='start').classes('bg-blue-100 w-1/5 h-full') as l_col:
        ui.button('Left')
    with ui.column(wrap=False, align_items='start').classes('bg-blue-100 w-3/5') as m_col:
        ui.button('Middle')
    with ui.column(wrap=False, align_items='start').classes('bg-blue-100 w-1/5') as r_col:
        ui.button('Right')

ui.run()
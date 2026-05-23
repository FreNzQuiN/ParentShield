<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'ParentShield') }}</title>

    @if (file_exists(public_path('hot')))
        @php
            $viteUrl = rtrim(trim(file_get_contents(public_path('hot'))), '/');
        @endphp
        <script type="module">
            import { injectIntoGlobalHook } from '{{ $viteUrl }}/@react-refresh';
            injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => () => {};
        </script>
    @endif
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @endif
</head>
<body class="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
    <div id="app"></div>
</body>
</html>

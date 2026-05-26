<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
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

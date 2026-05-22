<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('adguard_api_key_encrypted')->nullable()->after('password');
            $table->timestamp('adguard_api_key_verified_at')->nullable()->after('adguard_api_key_encrypted');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['adguard_api_key_encrypted', 'adguard_api_key_verified_at']);
        });
    }
};

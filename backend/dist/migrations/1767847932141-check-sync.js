"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckSync1767847932141 = void 0;
class CheckSync1767847932141 {
    constructor() {
        this.name = 'CheckSync1767847932141';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`registro_venta\` DROP FOREIGN KEY \`registro_venta_ibfk_1\``);
        await queryRunner.query(`ALTER TABLE \`registro_venta\` DROP FOREIGN KEY \`registro_venta_ibfk_2\``);
        await queryRunner.query(`DROP INDEX \`SKU\` ON \`producto\``);
        await queryRunner.query(`DROP INDEX \`codigo_barras\` ON \`producto\``);
        await queryRunner.query(`DROP INDEX \`ID_venta\` ON \`registro_venta\``);
        await queryRunner.query(`DROP INDEX \`ID_producto\` ON \`registro_venta\``);
        await queryRunner.query(`DROP INDEX \`email\` ON \`usuario\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`passwrd\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`variante\` \`variante\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`marca\` \`marca\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`proveedor\` \`proveedor\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`precio_compra\` \`precio_compra\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`stock\` \`stock\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`precio_venta\` \`precio_venta\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`venta\` CHANGE \`total\` \`total\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`venta\` CHANGE \`fecha\` \`fecha\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD UNIQUE INDEX \`IDX_2863682842e688ca198eb25c12\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`rol\` \`rol\` tinyint NOT NULL DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE \`registro_venta\` ADD CONSTRAINT \`FK_3d9493c7464f4272734d9b6d8ef\` FOREIGN KEY (\`ID_venta\`) REFERENCES \`venta\`(\`ID_venta\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`registro_venta\` ADD CONSTRAINT \`FK_9237c8bdfaf3d92bf2bbad0b1c3\` FOREIGN KEY (\`ID_producto\`) REFERENCES \`producto\`(\`ID_producto\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`registro_venta\` DROP FOREIGN KEY \`FK_9237c8bdfaf3d92bf2bbad0b1c3\``);
        await queryRunner.query(`ALTER TABLE \`registro_venta\` DROP FOREIGN KEY \`FK_3d9493c7464f4272734d9b6d8ef\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`rol\` \`rol\` tinyint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP INDEX \`IDX_2863682842e688ca198eb25c12\``);
        await queryRunner.query(`ALTER TABLE \`venta\` CHANGE \`fecha\` \`fecha\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`venta\` CHANGE \`total\` \`total\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`precio_venta\` \`precio_venta\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`stock\` \`stock\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`precio_compra\` \`precio_compra\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`proveedor\` \`proveedor\` varchar(255) NOT NULL DEFAULT ''0''`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`marca\` \`marca\` varchar(255) NOT NULL DEFAULT ''0''`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`variante\` \`variante\` varchar(255) NOT NULL DEFAULT ''0''`);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`passwrd\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`email\` ON \`usuario\` (\`email\`)`);
        await queryRunner.query(`CREATE INDEX \`ID_producto\` ON \`registro_venta\` (\`ID_producto\`)`);
        await queryRunner.query(`CREATE INDEX \`ID_venta\` ON \`registro_venta\` (\`ID_venta\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`codigo_barras\` ON \`producto\` (\`codigo_barras\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`SKU\` ON \`producto\` (\`SKU\`)`);
        await queryRunner.query(`ALTER TABLE \`registro_venta\` ADD CONSTRAINT \`registro_venta_ibfk_2\` FOREIGN KEY (\`ID_producto\`) REFERENCES \`producto\`(\`ID_producto\`) ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`registro_venta\` ADD CONSTRAINT \`registro_venta_ibfk_1\` FOREIGN KEY (\`ID_venta\`) REFERENCES \`venta\`(\`ID_venta\`) ON DELETE RESTRICT ON UPDATE RESTRICT`);
    }
}
exports.CheckSync1767847932141 = CheckSync1767847932141;
//# sourceMappingURL=1767847932141-check-sync.js.map
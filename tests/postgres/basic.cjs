const pg=require('./pg.cjs'),path=require('path');const root=path.resolve(__dirname,'../..');
pg.verifyCluster();
if(pg.sql("select count(*) from pg_database where datname='sakupage_empty'",{db:'postgres'})==='1'){if(pg.sql("select value from sakupage_fixture_guard.identity where key='purpose'")!=='synthetic-only-local-lab')throw Error('Refusing non-synthetic existing DB');pg.sql('drop database sakupage_empty',{db:'postgres'});}pg.sql('create database sakupage_empty',{db:'postgres'});pg.file(path.join(__dirname,'bootstrap.sql'));
const files=['001_initial_schema.sql','002_demo_shares.sql','003_customer_portal.sql','004_atomic_contracts.sql','20261108085735_fix_business_conflict_status.sql','20261108093204_demo_deliveries.sql'];
for(const f of files){pg.file(root+'/supabase/migrations/'+f);console.log('PASS migration '+f)}
pg.file(root+'/supabase/pending/20261111005014_operator_atomic_save_and_delivery_budget.sql');console.log('PASS pending SQL syntax/application');
pg.file(root+'/tests/sql/pending-features.sql');console.log('PASS transactional pending feature test');

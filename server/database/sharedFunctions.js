var connection = require("./knex");
var log = require("../logging/log").log;
const knex = connection.knex;

exports.CreateOrReplaceSharedFunctions = async function() {
  log.info("Creating or replacing shared functions", "\n");
  try {
    let result = null;
    result = await knex.raw(
      `
        CREATE OR REPLACE FUNCTION shared_functions.CreateuserTable()
        RETURNS trigger
        COST 100
        LANGUAGE 'plpgsql'
        VOLATILE NOT LEAKPROOF 
        AS $BODY3$
          BEGIN
            execute format('Set search_path to 
              '||quote_ident(TG_TABLE_SCHEMA)||',public');

            /*Add a field to all existing user tables with 
             the name of this new table with the suffix _id
             This will allow any other table to be used as a
             child table of this table */
            Insert into datafield(datatable_id,name,datatype)
              select 
                _id,NEW.name||'_id','uuid'
              from 
                datatable
              where 
                _id!=NEW._id;

              execute format('create table '||quote_ident(NEW.name)||' (
              _id uuid primary key default gen_random_uuid(),
              created_at TIMESTAMP default now())');
            
              /* Add the id field of every other existing table to the
              new table so it can be used as a child of any other 
              existing table */
              Insert into datafield(datatable_id,name,datatype)
              select NEW._id,name||'_id','uuid'
              from datatable
              where _id!=NEW._id; 

            RETURN NEW;
          END;
        $BODY3$;
     
        Create or replace function shared_functions.ChangeTableName()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY4$
          BEGIN

            execute format('Set search_path to '||quote_ident(TG_TABLE_SCHEMA)||',public');

            If(OLD.name != NEW.name) then
              Execute format(
                'Alter table '||quote_ident(OLD.name)||'
                Rename to '||quote_ident(NEW.name)||' ');

                Update datafield set name=NEW.name||'_id' where name=OLD.name||'_id';
                
            END IF;
          
            RETURN NEW;
          END;
        $BODY4$;

      CREATE or replace FUNCTION shared_functions.DeleteTable()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY5$
          BEGIN

            execute format('Set search_path to '||quote_ident(TG_TABLE_SCHEMA)||',public');

            Delete from datafield where datatable_id = OLD._id;

            Execute format('Drop table '|| quote_ident(OLD.name) ||' '); 

            Delete from datafield where  name = OLD.name||'_id';
            
           RETURN OLD;
          END;
        $BODY5$;

        CREATE or Replace FUNCTION shared_functions.addcolumn()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY6$
          declare
            theTableName text;
          BEGIN
            execute format('Set search_path to '||quote_ident(TG_TABLE_SCHEMA)||',public');
            Select 
              datatable.name 
            into 
              theTableName
            from 
              datatable
            where 
              datatable._id = NEW.datatable_id; 
              Execute format(
                'Alter table '||quote_ident(theTableName)||'
                add column '||quote_ident(NEW.name) ||' '||NEW.datatype||' ');
            RETURN NEW;
          END;
        $BODY6$;

        CREATE Or Replace FUNCTION shared_functions.renamecolumn()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY7$
          declare
            theTableName text;
          BEGIN
          execute format('Set search_path to '||quote_ident(TG_TABLE_SCHEMA)||',public');
            If( NEW.name != OLD.name) then
            Select 
              datatable.name 
            into 
              theTableName
            from 
              datatable
            where 
              datatable._id = OLD.datatable_id; 
                Execute format(
                  'Alter table '||quote_ident(theTableName)||'
                  rename column '||quote_ident(OLD.name)||' 
                   to '||quote_ident(NEW.name)||' ');
            end if;
            RETURN NEW;
          END;
        $BODY7$;

        CREATE Or Replace FUNCTION shared_functions.DropColumn()
          RETURNS trigger
          LANGUAGE 'plpgsql'
          COST 100
          VOLATILE NOT LEAKPROOF 
          AS $BODY8$
            declare
              theTableName text;
            BEGIN
            execute format('Set search_path to '||quote_ident(TG_TABLE_SCHEMA)||',public');
              Select 
                datatable.name 
              into 
                theTableName
              from 
                datatable
              where 
                datatable._id = OLD.datatable_id; 
                Execute format(
                  'Alter table '||quote_ident(theTableName)||'
                  drop column '||quote_ident(OLD.name)||' '); 
              RETURN OLD;
            END;
          $BODY8$; 


      CREATE or REPLACE FUNCTION shared_functions.CreateAppSchema()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY$
          DECLARE
          theName varchar;
          theQIName varchar;
          theNameOld varchar;
          BEGIN

            theName := NEW._id;
            theNameOld := Concat('user','app');

            Execute 'CREATE Schema '||quote_ident(theName);

            Execute 'Set search_path to '||quote_ident(theName)||',public';
            
            Execute 'CREATE Table datatable(
              _id uuid primary key default gen_random_uuid(),
              name text,
              description Text,
              created_at timestamp default now()
            )';

            Execute 'CREATE Table datafield(
              _id uuid primary key default gen_random_uuid(),
              datatable_id uuid 
                References datatable (_id)
                On Delete Cascade,
              name text,
              description Text,
              datatype text,
              graph boolean,
              minGraph numeric,
              maxGraph numeric,
              avg_length numeric,
              orderOnPage numeric,
              referencevalue numeric,
              incrementValues numeric[],
              created_at timestamp default now()
            )'; 
          
            Execute 'CREATE Table device_data(
              _id uuid primary key default gen_random_uuid(),
              datatable_id uuid 
                References datatable (_id)
                On Delete Cascade,
              name text,
              description Text,
              datatype text,
              graph boolean,
              minGraph numeric,
              maxGraph numeric,
              orderOnPage numeric,
              referencevalue numeric,
              incrementValues numeric[],
              avg_length numeric,
              source text,
              created_at timestamp default now()
            )'; 


            Execute 'CREATE Table list(
              _id uuid primary key default gen_random_uuid(),
              name text,
              description Text,
              created_at timestamp default now()
              )';

            Execute 'CREATE Table listvalue(
              _id uuid primary key default gen_random_uuid(),
              list_id uuid 
                References list (_id)
                On Delete Cascade,
              listvalue text,
              created_at timestamp default now()
              )';
              
          
            Execute 'CREATE Table page(
              _id uuid primary key default gen_random_uuid(),
              datatable_id uuid 
                References datatable (_id)
                On Delete Cascade,
              name text,
              pagetype text,
              description Text,
              created_at timestamp default now()
              )';

            Execute 'Drop view if exists findEligiblePages';

            Execute 'Create  view findEligiblePages as
              -- Get the pages
              select P._id page_id, P.name pname,DT.name dtname, P2.name p2name, P2._id p2_id from page P
              -- Join the datatable to the page so you have the datatable name
              right join datatable DT
              on P.datatable_id = DT._id
              -- Now join on the pages that whose related datatable has a column with name of the first set
              -- of pages datatable names with _id added as the suffix.  These are elibible to be child pages
              inner join page P2 
              on P2.datatable_id in
              (
                select 
                  DT2._id from information_schema.columns Sch
                inner join 
                  datatable DT2
                on 
                  Sch.table_name = DT2.name 
                  and  
                  Sch.column_name = DT.name||''_id''
                  and Sch.table_schema='''||theName||''')
              order by P.name';

            Execute 'CREATE Table subpage(
              _id uuid primary key default gen_random_uuid(),
              page_id uuid 
                References page (_id)
                On Delete Cascade,
              subpage_id uuid
                References page (_id)
                On Delete Cascade,
              label text,
              defaultvalue text,
              description text,
              created_at timestamp default now()
              )'; 
        
            Execute 'CREATE Table pagefield(
              _id uuid primary key default gen_random_uuid(),
              datafield_id uuid 
                References datafield (_id)
                On Delete Cascade,
              page_id uuid 
                References page (_id)
                On Delete Cascade,
              valuelist_id uuid,
              label text,
              defaultvalue text,
              description text,
              created_at timestamp default now()
              )';

            Execute 'DROP TRIGGER IF EXISTS CreateUserTableOnInsert ON datatable;

            CREATE TRIGGER CreateUserTableOnInsert
            AFTER INSERT
              ON datatable
              FOR EACH ROW
              EXECUTE PROCEDURE shared_functions.CreateuserTable()'; 
          
            Execute 'DROP TRIGGER IF EXISTS ChangeTableNameOnUpdate ON datatable;

            CREATE TRIGGER ChangeTableNameOnUpdate
              AFTER UPDATE
              ON datatable
              FOR EACH ROW
              EXECUTE PROCEDURE shared_functions.ChangeTableName()'; 

            DROP TRIGGER IF EXISTS DeleteTableOnDelete ON datatable;

            CREATE TRIGGER DeleteTableOnDelete
              BEFORE DELETE
              ON datatable
              FOR EACH ROW
              EXECUTE PROCEDURE shared_functions.DeleteTable(); 

            DROP TRIGGER IF EXISTS AddColumnOnInsert ON datafield;

            CREATE TRIGGER AddColumnOnInsert
              AFTER INSERT
              ON datafield
              FOR EACH ROW
              EXECUTE PROCEDURE shared_functions.AddColumn();

            DROP TRIGGER IF EXISTS renamecolumn ON  datafield;

            CREATE TRIGGER renamecolumn AFTER 
                update
              ON 
                datafield
              FOR EACH ROW
              EXECUTE PROCEDURE 
                shared_functions.renamecolumn();
              
            DROP TRIGGER IF EXISTS DropColumn ON datafield;
                
            CREATE TRIGGER DropColumn 
              BEFORE 
                delete
              ON 
                datafield
              FOR EACH ROW
              EXECUTE PROCEDURE 
              shared_functions.DropColumn();
              
            RETURN NEW;
          END;
        $BODY$;
    `
    );
    result = await knex.raw(`
      -- FUNCTION: CreateDefaultApp()
       CREATE or REPLACE FUNCTION shared_functions.CreateDefaultApp()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY$
          DECLARE
          appId uuid;
          BEGIN
             appId = gen_random_uuid();
             Insert into meta.app (_id,user_id,name,app_type) 
             values (appId,NEW._id,'Your First App','custom');
             Update meta.user set defaultapp_id=appId where _id = NEW._id;
             
            RETURN NEW;
          END;
        $BODY$;
    `);

    result = await knex.raw(`
     -- FUNCTION: DeleteUserApps()
       CREATE or REPLACE FUNCTION shared_functions.DeleteUserApps()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY$
          DECLARE
          BEGIN
             Delete from meta.app where user_id = old._id;
             return old;
          END;
        $BODY$;
    `);

    result = await knex.raw(`
     -- FUNCTION: DeleteAppSchema()
       CREATE or REPLACE FUNCTION shared_functions.DeleteAppSchema()
        RETURNS trigger
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE NOT LEAKPROOF 
        AS $BODY$
          DECLARE
          BEGIN
             Execute format('Drop schema if exists '|| quote_ident(cast(old._id as text))||' cascade');
             return old;
          END;
        $BODY$;
    `);

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS CreateAppOnInsert ON meta.user;
       CREATE TRIGGER CreateAppOnInsert
       AFTER INSERT
         ON meta.user
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.CreateDefaultApp();
     `);

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS DeleteUserApps ON meta.user;
       CREATE TRIGGER DeleteUserApps
       Before delete
         ON meta.user
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.DeleteUserApps();
     `);

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS DeleteAppSchemaOnDelete ON meta.app;
       CREATE TRIGGER DeleteAppSchemaOnDelete
       Before delete
         ON meta.app
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.DeleteAppSchema();
     `);

    result = await knex.raw(`
       DROP TRIGGER IF EXISTS CreateAppSchema ON meta.app;
       CREATE TRIGGER CreateAppSchema
       AFTER INSERT
         ON meta.app
         FOR EACH ROW
         EXECUTE PROCEDURE shared_functions.CreateAppSchema();
     `);
  } catch (e) {
    console.log("Error creating app table triggers", e.message);
  }
};
